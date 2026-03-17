import {describe, expect, it} from "vitest";
import {getTransactionCounterparty} from "./utils";

function makeUserTx(
  func: string,
  args: unknown[],
  typeArgs: string[] = [],
): {
  type: string;
  payload: {
    type: string;
    function: string;
    type_arguments: string[];
    arguments: unknown[];
  };
} {
  return {
    type: "user_transaction",
    payload: {
      type: "entry_function_payload",
      function: func,
      type_arguments: typeArgs,
      arguments: args,
    },
  };
}

describe("getTransactionCounterparty", () => {
  it("returns undefined for non-user transactions", () => {
    const tx = {type: "block_metadata_transaction"};
    expect(getTransactionCounterparty(tx as never)).toBeUndefined();
  });

  it("returns undefined for user transactions without payload", () => {
    const tx = {type: "user_transaction"};
    expect(getTransactionCounterparty(tx as never)).toBeUndefined();
  });

  it("returns undefined for script payloads", () => {
    const tx = {
      type: "user_transaction",
      payload: {type: "script_payload"},
    };
    expect(getTransactionCounterparty(tx as never)).toBeUndefined();
  });

  describe("coin transfers (receiver at arguments[0])", () => {
    it("parses 0x1::coin::transfer", () => {
      const tx = makeUserTx(
        "0x1::coin::transfer",
        ["0xrecipient", "1000"],
        ["0x1::aptos_coin::AptosCoin"],
      );
      expect(getTransactionCounterparty(tx as never)).toEqual({
        address: "0xrecipient",
        role: "receiver",
      });
    });

    it("parses 0x1::aptos_account::transfer", () => {
      const tx = makeUserTx("0x1::aptos_account::transfer", [
        "0xrecipient",
        "5000",
      ]);
      expect(getTransactionCounterparty(tx as never)).toEqual({
        address: "0xrecipient",
        role: "receiver",
      });
    });

    it("parses 0x1::aptos_account::transfer_coins", () => {
      const tx = makeUserTx("0x1::aptos_account::transfer_coins", [
        "0xrecipient",
        "2000",
      ]);
      expect(getTransactionCounterparty(tx as never)).toEqual({
        address: "0xrecipient",
        role: "receiver",
      });
    });

    it("parses 0x1::aptos_account::fungible_transfer_only", () => {
      const tx = makeUserTx("0x1::aptos_account::fungible_transfer_only", [
        "0xrecipient",
        "3000",
      ]);
      expect(getTransactionCounterparty(tx as never)).toEqual({
        address: "0xrecipient",
        role: "receiver",
      });
    });
  });

  describe("object/FA transfers (receiver at arguments[1])", () => {
    it("parses 0x1::object::transfer", () => {
      const tx = makeUserTx("0x1::object::transfer", [
        "0xobject_addr",
        "0xrecipient",
      ]);
      expect(getTransactionCounterparty(tx as never)).toEqual({
        address: "0xrecipient",
        role: "receiver",
      });
    });

    it("parses 0x1::object::transfer_call", () => {
      const tx = makeUserTx("0x1::object::transfer_call", [
        "0xobject_addr",
        "0xrecipient",
      ]);
      expect(getTransactionCounterparty(tx as never)).toEqual({
        address: "0xrecipient",
        role: "receiver",
      });
    });

    it("parses 0x1::aptos_account::transfer_fungible_assets", () => {
      const tx = makeUserTx("0x1::aptos_account::transfer_fungible_assets", [
        {
          inner:
            "0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b",
        },
        "0xb5fcaf97d7716f1cfd0d7ae592a85c31cc98f7e44f492f372b34fd7386e015c7",
        "15021000000",
      ]);
      const result = getTransactionCounterparty(tx as never);
      expect(result).toEqual({
        address:
          "0xb5fcaf97d7716f1cfd0d7ae592a85c31cc98f7e44f492f372b34fd7386e015c7",
        role: "receiver",
      });
    });

    it("parses 0x1::primary_fungible_store::transfer", () => {
      const tx = makeUserTx("0x1::primary_fungible_store::transfer", [
        {inner: "0xmetadata"},
        "0xrecipient",
        "5000",
      ]);
      expect(getTransactionCounterparty(tx as never)).toEqual({
        address: "0xrecipient",
        role: "receiver",
      });
    });
  });

  describe("token v2 soulbound mint", () => {
    it("parses 0x4::aptos_token::mint_soul_bound with receiver at arguments[7]", () => {
      const args = Array(8).fill("0x0");
      args[7] = "0xrecipient";
      const tx = makeUserTx("0x4::aptos_token::mint_soul_bound", args);
      expect(getTransactionCounterparty(tx as never)).toEqual({
        address: "0xrecipient",
        role: "receiver",
      });
    });
  });

  describe("smart contract interactions", () => {
    it("returns smart contract address for unknown functions", () => {
      const tx = makeUserTx("0xdeadbeef::my_module::do_something", [
        "arg1",
        "arg2",
      ]);
      expect(getTransactionCounterparty(tx as never)).toEqual({
        address: "0xdeadbeef",
        role: "smartContract",
      });
    });
  });

  describe("multisig payload", () => {
    it("parses receiver from multisig entry function payload", () => {
      const tx = {
        type: "user_transaction",
        payload: {
          type: "multisig_payload",
          multisig_address: "0xmultisig",
          transaction_payload: {
            type: "entry_function_payload",
            function: "0x1::aptos_account::transfer_fungible_assets",
            type_arguments: [],
            arguments: [{inner: "0xmetadata"}, "0xrecipient", "1000"],
          },
        },
      };
      expect(getTransactionCounterparty(tx as never)).toEqual({
        address: "0xrecipient",
        role: "receiver",
      });
    });
  });
});
