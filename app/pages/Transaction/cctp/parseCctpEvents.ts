import type {Types} from "~/types/aptos";

/** Circle CCTP TokenMessengerMinter package addresses on Aptos. */
export const CCTP_TOKEN_MESSENGER_PACKAGES = [
  "0x9bce6734f7b63e835108e3bd8c36743d4709fe435f44791918801d0989640a9d", // mainnet
  "0x5f9b937419dda90aa06c1836b7847f65bbbe3f1217567758dc2488be31a477b9", // testnet
] as const;

/** Circle CCTP MessageTransmitter package addresses on Aptos. */
export const CCTP_MESSAGE_TRANSMITTER_PACKAGES = [
  "0x177e17751820e4b4371873ca8c30279be63bdea63b88ed0f2239c2eea10f1772", // mainnet
  "0x081e86cebf457a0c6004f35bd648a2794698f52e0dde09a48619dcd3d4cc23d9", // testnet
] as const;

const DEPOSIT_FOR_BURN_SUFFIX = "::token_messenger::DepositForBurn";
const MINT_AND_WITHDRAW_SUFFIX = "::token_messenger::MintAndWithdraw";
const MESSAGE_RECEIVED_SUFFIX = "::message_transmitter::MessageReceived";

export type CctpBridgeOut = {
  actionType: "cctp bridge out";
  amount: number;
  burn_token: string;
  depositor: string;
  mint_recipient: string;
  destination_domain: number;
  nonce: string;
};

export type CctpBridgeIn = {
  actionType: "cctp bridge in";
  amount: number;
  mint_token: string;
  mint_recipient: string;
  /** Source CCTP domain from MessageReceived when present in the same transaction. */
  source_domain?: number;
  /** Source-chain sender (bytes32) from MessageReceived when present. */
  source_sender?: string;
};

function isCctpDepositForBurnEvent(eventType: string): boolean {
  return CCTP_TOKEN_MESSENGER_PACKAGES.some(
    (pkg) => eventType === `${pkg}${DEPOSIT_FOR_BURN_SUFFIX}`,
  );
}

function isCctpMintAndWithdrawEvent(eventType: string): boolean {
  return CCTP_TOKEN_MESSENGER_PACKAGES.some(
    (pkg) => eventType === `${pkg}${MINT_AND_WITHDRAW_SUFFIX}`,
  );
}

function isCctpMessageReceivedEvent(eventType: string): boolean {
  return CCTP_MESSAGE_TRANSMITTER_PACKAGES.some(
    (pkg) => eventType === `${pkg}${MESSAGE_RECEIVED_SUFFIX}`,
  );
}

export function parseCctpDepositForBurnEvent(
  event: Types.Event,
): CctpBridgeOut | undefined {
  if (!isCctpDepositForBurnEvent(event.type)) {
    return undefined;
  }

  const data = event.data as {
    amount: string;
    burn_token: string;
    depositor: string;
    mint_recipient: string;
    destination_domain: string | number;
    nonce: string;
  };

  return {
    actionType: "cctp bridge out",
    amount: Number(data.amount),
    burn_token: data.burn_token,
    depositor: data.depositor,
    mint_recipient: data.mint_recipient,
    destination_domain: Number(data.destination_domain),
    nonce: data.nonce,
  };
}

export function parseCctpMintAndWithdrawEvent(
  event: Types.Event,
): CctpBridgeIn | undefined {
  if (!isCctpMintAndWithdrawEvent(event.type)) {
    return undefined;
  }

  const data = event.data as {
    amount: string;
    mint_token: string;
    mint_recipient: string;
  };

  return {
    actionType: "cctp bridge in",
    amount: Number(data.amount),
    mint_token: data.mint_token,
    mint_recipient: data.mint_recipient,
  };
}

export function parseCctpMessageReceivedEvent(
  event: Types.Event,
): {source_domain: number; source_sender: string} | undefined {
  if (!isCctpMessageReceivedEvent(event.type)) {
    return undefined;
  }

  const data = event.data as {
    source_domain: string | number;
    sender: string;
  };
  return {
    source_domain: Number(data.source_domain),
    source_sender: data.sender,
  };
}

/** Pair each inbound CCTP action with the matching MessageReceived by event order. */
export function enrichCctpBridgeInActions<T extends {actionType: string}>(
  events: Types.Event[],
  actions: T[],
): T[] {
  const messageReceivedList = events
    .map(parseCctpMessageReceivedEvent)
    .filter((message) => message !== undefined);

  if (messageReceivedList.length === 0) {
    return actions;
  }

  let messageIndex = 0;
  return actions.map((action) => {
    if (action.actionType !== "cctp bridge in") {
      return action;
    }

    const messageReceived = messageReceivedList[messageIndex];
    messageIndex += 1;
    if (!messageReceived) {
      return action;
    }

    const {source_domain, source_sender} = messageReceived;
    return {...action, source_domain, source_sender} as T;
  });
}
