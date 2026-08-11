// Covers FEAT-TXN-009 — CCTP event parsing
import {describe, expect, it} from "vitest";
import type {Types} from "~/types/aptos";
import {
  CCTP_MESSAGE_TRANSMITTER_PACKAGES,
  CCTP_TOKEN_MESSENGER_PACKAGES,
  enrichCctpBridgeInActions,
  parseCctpDepositForBurnEvent,
  parseCctpMessageReceivedEvent,
  parseCctpMintAndWithdrawEvent,
} from "./parseCctpEvents";

function makeEvent(type: string, data: Record<string, unknown>): Types.Event {
  return {
    guid: {creation_number: "0", account_address: "0x1"},
    sequence_number: "0",
    type,
    data,
  };
}

describe("FEAT-TXN-009 — parseCctpDepositForBurnEvent", () => {
  it("parses mainnet DepositForBurn", () => {
    const pkg = CCTP_TOKEN_MESSENGER_PACKAGES[0];
    const event = makeEvent(`${pkg}::token_messenger::DepositForBurn`, {
      nonce: "42",
      burn_token:
        "0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b",
      amount: "1000000",
      depositor:
        "0x2a8227993a4e38537a57caefe5e7e9a51327bf6cd732c1f56648f26f68304ebc",
      mint_recipient:
        "0x000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045",
      destination_domain: 6,
      destination_token_messenger: "0x0000000000000000000000000000000000000001",
      destination_caller: "0x0",
    });

    const result = parseCctpDepositForBurnEvent(event);
    expect(result).toEqual({
      actionType: "cctp bridge out",
      amount: 1000000,
      burn_token:
        "0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b",
      depositor:
        "0x2a8227993a4e38537a57caefe5e7e9a51327bf6cd732c1f56648f26f68304ebc",
      mint_recipient:
        "0x000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045",
      destination_domain: 6,
      nonce: "42",
    });
  });

  it("parses testnet DepositForBurn", () => {
    const pkg = CCTP_TOKEN_MESSENGER_PACKAGES[1];
    const event = makeEvent(`${pkg}::token_messenger::DepositForBurn`, {
      nonce: "1",
      burn_token:
        "0x69091fbab5f7d635ee7ac5098cf0c1efbe31d68fec0f2cd565e8d168daf52832",
      amount: "100",
      depositor: "0x1",
      mint_recipient:
        "0x000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045",
      destination_domain: 0,
      destination_token_messenger: "0x1",
      destination_caller: "0x0",
    });

    expect(parseCctpDepositForBurnEvent(event)?.actionType).toBe(
      "cctp bridge out",
    );
  });

  it("returns undefined for unrelated events", () => {
    const event = makeEvent("0x1::aptos_coin::DepositEvent", {amount: "1"});
    expect(parseCctpDepositForBurnEvent(event)).toBeUndefined();
  });
});

describe("FEAT-TXN-009 — parseCctpMintAndWithdrawEvent", () => {
  it("parses mainnet MintAndWithdraw", () => {
    const pkg = CCTP_TOKEN_MESSENGER_PACKAGES[0];
    const event = makeEvent(`${pkg}::token_messenger::MintAndWithdraw`, {
      mint_recipient:
        "0x2a8227993a4e38537a57caefe5e7e9a51327bf6cd732c1f56648f26f68304ebc",
      amount: "500000",
      mint_token:
        "0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b",
    });

    const result = parseCctpMintAndWithdrawEvent(event);
    expect(result).toEqual({
      actionType: "cctp bridge in",
      amount: 500000,
      mint_token:
        "0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b",
      mint_recipient:
        "0x2a8227993a4e38537a57caefe5e7e9a51327bf6cd732c1f56648f26f68304ebc",
    });
  });
});

describe("FEAT-TXN-009 — parseCctpMessageReceivedEvent", () => {
  it("parses mainnet MessageReceived", () => {
    const pkg = CCTP_MESSAGE_TRANSMITTER_PACKAGES[0];
    const event = makeEvent(`${pkg}::message_transmitter::MessageReceived`, {
      caller:
        "0x9bce6734f7b63e835108e3bd8c36743d4709fe435f44791918801d0989640a9d",
      source_domain: 6,
      nonce: "99",
      sender: "0x0000000000000000000000000000000000000001",
      message_body: "0x",
    });

    expect(parseCctpMessageReceivedEvent(event)).toEqual({
      source_domain: 6,
      source_sender: "0x0000000000000000000000000000000000000001",
    });
  });
});

describe("FEAT-TXN-009 — enrichCctpBridgeInActions", () => {
  it("attaches MessageReceived source fields to bridge-in actions", () => {
    const messengerPkg = CCTP_TOKEN_MESSENGER_PACKAGES[0];
    const transmitterPkg = CCTP_MESSAGE_TRANSMITTER_PACKAGES[0];
    const events = [
      makeEvent(`${messengerPkg}::token_messenger::MintAndWithdraw`, {
        mint_recipient: "0x1",
        amount: "100",
        mint_token: "0x2",
      }),
      makeEvent(`${transmitterPkg}::message_transmitter::MessageReceived`, {
        caller: "0x3",
        source_domain: 0,
        nonce: "1",
        sender: "0x4",
        message_body: "0x",
      }),
    ];

    const bridgeIn = parseCctpMintAndWithdrawEvent(events[0]);
    expect(bridgeIn).toBeDefined();

    const actions = [
      bridgeIn as NonNullable<typeof bridgeIn>,
      {actionType: "swap" as const, foo: "bar"},
    ];
    const enriched = enrichCctpBridgeInActions(events, actions);

    expect(enriched[0]).toMatchObject({
      actionType: "cctp bridge in",
      source_domain: 0,
      source_sender: "0x4",
    });
    expect(enriched[1]).toEqual(actions[1]);
  });

  it("pairs each bridge-in action with its own MessageReceived in event order", () => {
    const messengerPkg = CCTP_TOKEN_MESSENGER_PACKAGES[0];
    const transmitterPkg = CCTP_MESSAGE_TRANSMITTER_PACKAGES[0];
    const events = [
      makeEvent(`${messengerPkg}::token_messenger::MintAndWithdraw`, {
        mint_recipient: "0x1",
        amount: "100",
        mint_token: "0x2",
      }),
      makeEvent(`${transmitterPkg}::message_transmitter::MessageReceived`, {
        caller: "0x3",
        source_domain: 0,
        nonce: "1",
        sender: "0xaaa",
        message_body: "0x",
      }),
      makeEvent(`${messengerPkg}::token_messenger::MintAndWithdraw`, {
        mint_recipient: "0x4",
        amount: "200",
        mint_token: "0x5",
      }),
      makeEvent(`${transmitterPkg}::message_transmitter::MessageReceived`, {
        caller: "0x6",
        source_domain: 6,
        nonce: "2",
        sender: "0xbbb",
        message_body: "0x",
      }),
    ];

    const firstMint = parseCctpMintAndWithdrawEvent(events[0]);
    const secondMint = parseCctpMintAndWithdrawEvent(events[2]);
    expect(firstMint).toBeDefined();
    expect(secondMint).toBeDefined();

    const actions = [
      firstMint as NonNullable<typeof firstMint>,
      secondMint as NonNullable<typeof secondMint>,
    ];
    const enriched = enrichCctpBridgeInActions(events, actions);

    expect(enriched[0]).toMatchObject({
      source_domain: 0,
      source_sender: "0xaaa",
    });
    expect(enriched[1]).toMatchObject({
      source_domain: 6,
      source_sender: "0xbbb",
    });
  });
});
