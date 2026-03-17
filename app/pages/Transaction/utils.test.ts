import {describe, expect, it} from "vitest";
import type {Types} from "~/types/aptos";
import {
  getCoinBalanceChangeForAccount,
  getTransactionAmount,
  getTransactionCounterparty,
} from "./utils";

function makeUserTx(
  func: string,
  args: unknown[],
  typeArgs: string[] = [],
  extra: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    type: "user_transaction",
    payload: {
      type: "entry_function_payload",
      function: func,
      type_arguments: typeArgs,
      arguments: args,
    },
    ...extra,
  };
}

function makeObjectCoreChange(address: string, owner: string) {
  return {
    type: "write_resource",
    address,
    data: {
      type: "0x1::object::ObjectCore",
      data: {owner},
    },
  };
}

function makeUserTransaction(
  overrides: Partial<Types.Transaction_UserTransaction> = {},
): Types.Transaction_UserTransaction {
  return {
    type: "user_transaction",
    version: "1",
    hash: "0xabc",
    state_change_hash: "0x",
    event_root_hash: "0x",
    state_checkpoint_hash: null,
    gas_used: "100",
    success: true,
    vm_status: "Executed successfully",
    accumulator_root_hash: "0x",
    changes: [],
    sender:
      "0x0000000000000000000000000000000000000000000000000000000000000099",
    sequence_number: "0",
    max_gas_amount: "10000",
    gas_unit_price: "100",
    expiration_timestamp_secs: "999999999",
    payload: {
      type: "entry_function_payload",
      function: "0x1::aptos_account::transfer",
      type_arguments: [],
      arguments: [],
    },
    events: [],
    timestamp: "1000000",
    ...overrides,
  };
}

const DELEGATOR_ADDR =
  "0x0000000000000000000000000000000000000000000000000000000000000099";
const POOL_ADDR =
  "0x06099edbe54f242bad50020dfd67646b1e46282999483e7064e70f02f7ea3c15";
const RECEIVER_ADDR =
  "0x0000000000000000000000000000000000000000000000000000000000000055";

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

  describe("store-to-store FA transfers (receiver resolved from changes)", () => {
    const storeAddr =
      "0x0000000000000000000000000000000000000000000000000000000000000abc";
    const ownerAddr =
      "0x0000000000000000000000000000000000000000000000000000000000001234";

    it("parses 0x1::fungible_asset::transfer with ObjectCore change", () => {
      const tx = makeUserTx(
        "0x1::fungible_asset::transfer",
        [{inner: "0xfrom_store"}, {inner: storeAddr}, "1000"],
        [],
        {changes: [makeObjectCoreChange(storeAddr, ownerAddr)]},
      );
      const result = getTransactionCounterparty(tx as never);
      expect(result).toEqual({
        address: ownerAddr,
        role: "receiver",
      });
    });

    it("parses 0x1::dispatchable_fungible_asset::transfer with ObjectCore change", () => {
      const tx = makeUserTx(
        "0x1::dispatchable_fungible_asset::transfer",
        [{inner: "0xfrom_store"}, {inner: storeAddr}, "2000"],
        [],
        {changes: [makeObjectCoreChange(storeAddr, ownerAddr)]},
      );
      const result = getTransactionCounterparty(tx as never);
      expect(result).toEqual({
        address: ownerAddr,
        role: "receiver",
      });
    });

    it("falls through to smart contract when no changes available", () => {
      const tx = makeUserTx("0x1::fungible_asset::transfer", [
        {inner: "0xfrom_store"},
        {inner: storeAddr},
        "1000",
      ]);
      const result = getTransactionCounterparty(tx as never);
      expect(result).toEqual({
        address:
          "0x0000000000000000000000000000000000000000000000000000000000000001",
        role: "smartContract",
      });
    });
  });

  describe("batch FA transfer", () => {
    it("returns single receiver for batch with one recipient", () => {
      const tx = makeUserTx(
        "0x1::aptos_account::batch_transfer_fungible_assets",
        [{inner: "0xmetadata"}, ["0xrecipient_a"], ["1000"]],
      );
      expect(getTransactionCounterparty(tx as never)).toEqual({
        address: "0xrecipient_a",
        role: "receiver",
      });
    });

    it("falls through for batch with multiple recipients", () => {
      const tx = makeUserTx(
        "0x1::aptos_account::batch_transfer_fungible_assets",
        [
          {inner: "0xmetadata"},
          ["0xrecipient_a", "0xrecipient_b"],
          ["1000", "2000"],
        ],
      );
      const result = getTransactionCounterparty(tx as never);
      expect(result).toEqual({
        address:
          "0x0000000000000000000000000000000000000000000000000000000000000001",
        role: "smartContract",
      });
    });

    it("falls through for batch with empty recipients", () => {
      const tx = makeUserTx(
        "0x1::aptos_account::batch_transfer_fungible_assets",
        [{inner: "0xmetadata"}, [], []],
      );
      const result = getTransactionCounterparty(tx as never);
      expect(result).toEqual({
        address:
          "0x0000000000000000000000000000000000000000000000000000000000000001",
        role: "smartContract",
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
    it("returns standardized smart contract address for unknown functions", () => {
      const tx = makeUserTx("0xdeadbeef::my_module::do_something", [
        "arg1",
        "arg2",
      ]);
      expect(getTransactionCounterparty(tx as never)).toEqual({
        address:
          "0x00000000000000000000000000000000000000000000000000000000deadbeef",
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

describe("getCoinBalanceChangeForAccount", () => {
  it("returns 0 for an account not involved in the transaction", () => {
    const txn = makeUserTransaction();
    expect(getCoinBalanceChangeForAccount(txn, POOL_ADDR)).toBe(BigInt(0));
  });

  it("returns correct balance for a standard coin transfer (sender)", () => {
    const txn = makeUserTransaction({
      changes: [
        {
          type: "write_resource",
          address: DELEGATOR_ADDR,
          state_key_hash: "0x",
          data: {
            type: "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
            data: {
              coin: {value: "0"},
              deposit_events: {
                guid: {id: {addr: DELEGATOR_ADDR, creation_num: "2"}},
              },
              withdraw_events: {
                guid: {id: {addr: DELEGATOR_ADDR, creation_num: "3"}},
              },
            },
          },
        } as unknown as Types.WriteSetChange,
        {
          type: "write_resource",
          address: RECEIVER_ADDR,
          state_key_hash: "0x",
          data: {
            type: "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
            data: {
              coin: {value: "1000"},
              deposit_events: {
                guid: {id: {addr: RECEIVER_ADDR, creation_num: "2"}},
              },
              withdraw_events: {
                guid: {id: {addr: RECEIVER_ADDR, creation_num: "3"}},
              },
            },
          },
        } as unknown as Types.WriteSetChange,
      ],
      events: [
        {
          type: "0x1::coin::WithdrawEvent",
          guid: {account_address: DELEGATOR_ADDR, creation_number: "3"},
          sequence_number: "0",
          data: {amount: "1000"},
        },
        {
          type: "0x1::coin::DepositEvent",
          guid: {account_address: RECEIVER_ADDR, creation_number: "2"},
          sequence_number: "0",
          data: {amount: "1000"},
        },
      ],
    });

    expect(getCoinBalanceChangeForAccount(txn, DELEGATOR_ADDR)).toBe(
      BigInt(-1000),
    );
    expect(getCoinBalanceChangeForAccount(txn, RECEIVER_ADDR)).toBe(
      BigInt(1000),
    );
  });

  it("returns inferred positive amount for delegation pool add_stake", () => {
    const txn = makeUserTransaction({
      payload: {
        type: "entry_function_payload",
        function: "0x1::delegation_pool::add_stake",
        type_arguments: [],
        arguments: [POOL_ADDR, "5000000"],
      },
      changes: [
        {
          type: "write_resource",
          address: DELEGATOR_ADDR,
          state_key_hash: "0x",
          data: {
            type: "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
            data: {
              coin: {value: "0"},
              deposit_events: {
                guid: {id: {addr: DELEGATOR_ADDR, creation_num: "2"}},
              },
              withdraw_events: {
                guid: {id: {addr: DELEGATOR_ADDR, creation_num: "3"}},
              },
            },
          },
        } as unknown as Types.WriteSetChange,
        {
          type: "write_resource",
          address: POOL_ADDR,
          state_key_hash: "0x",
          data: {
            type: "0x1::stake::StakePool",
            data: {active: {value: "5000000"}},
          },
        } as unknown as Types.WriteSetChange,
      ],
      events: [
        {
          type: "0x1::coin::WithdrawEvent",
          guid: {account_address: DELEGATOR_ADDR, creation_number: "3"},
          sequence_number: "0",
          data: {amount: "5000000"},
        },
      ],
    });

    const poolChange = getCoinBalanceChangeForAccount(txn, POOL_ADDR);
    expect(poolChange).toBe(BigInt(5000000));

    const delegatorChange = getCoinBalanceChangeForAccount(txn, DELEGATOR_ADDR);
    expect(delegatorChange).toBe(BigInt(-5000000));
  });

  it("returns inferred negative amount for delegation pool withdraw", () => {
    const txn = makeUserTransaction({
      payload: {
        type: "entry_function_payload",
        function: "0x1::delegation_pool::withdraw",
        type_arguments: [],
        arguments: [POOL_ADDR, "3000000"],
      },
      changes: [
        {
          type: "write_resource",
          address: DELEGATOR_ADDR,
          state_key_hash: "0x",
          data: {
            type: "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
            data: {
              coin: {value: "3000000"},
              deposit_events: {
                guid: {id: {addr: DELEGATOR_ADDR, creation_num: "2"}},
              },
              withdraw_events: {
                guid: {id: {addr: DELEGATOR_ADDR, creation_num: "3"}},
              },
            },
          },
        } as unknown as Types.WriteSetChange,
        {
          type: "write_resource",
          address: POOL_ADDR,
          state_key_hash: "0x",
          data: {
            type: "0x1::stake::StakePool",
            data: {active: {value: "0"}},
          },
        } as unknown as Types.WriteSetChange,
      ],
      events: [
        {
          type: "0x1::coin::DepositEvent",
          guid: {account_address: DELEGATOR_ADDR, creation_number: "2"},
          sequence_number: "0",
          data: {amount: "3000000"},
        },
      ],
    });

    const poolChange = getCoinBalanceChangeForAccount(txn, POOL_ADDR);
    expect(poolChange).toBe(BigInt(-3000000));

    const delegatorChange = getCoinBalanceChangeForAccount(txn, DELEGATOR_ADDR);
    expect(delegatorChange).toBe(BigInt(3000000));
  });

  it("handles address normalization (short address lookup)", () => {
    const shortAddr = "0x1";
    const fullAddr =
      "0x0000000000000000000000000000000000000000000000000000000000000001";
    const txn = makeUserTransaction({
      changes: [
        {
          type: "write_resource",
          address: fullAddr,
          state_key_hash: "0x",
          data: {
            type: "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
            data: {
              coin: {value: "500"},
              deposit_events: {guid: {id: {addr: fullAddr, creation_num: "2"}}},
              withdraw_events: {
                guid: {id: {addr: fullAddr, creation_num: "3"}},
              },
            },
          },
        } as unknown as Types.WriteSetChange,
      ],
      events: [
        {
          type: "0x1::coin::DepositEvent",
          guid: {account_address: fullAddr, creation_number: "2"},
          sequence_number: "0",
          data: {amount: "500"},
        },
      ],
    });

    expect(getCoinBalanceChangeForAccount(txn, shortAddr)).toBe(BigInt(500));
    expect(getCoinBalanceChangeForAccount(txn, fullAddr)).toBe(BigInt(500));
  });

  it("returns 0 for account with write set changes but balanced coin flow", () => {
    const otherAddr =
      "0x0000000000000000000000000000000000000000000000000000000000000077";
    const txn = makeUserTransaction({
      changes: [
        {
          type: "write_resource",
          address: DELEGATOR_ADDR,
          state_key_hash: "0x",
          data: {
            type: "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
            data: {
              coin: {value: "0"},
              deposit_events: {
                guid: {id: {addr: DELEGATOR_ADDR, creation_num: "2"}},
              },
              withdraw_events: {
                guid: {id: {addr: DELEGATOR_ADDR, creation_num: "3"}},
              },
            },
          },
        } as unknown as Types.WriteSetChange,
        {
          type: "write_resource",
          address: otherAddr,
          state_key_hash: "0x",
          data: {
            type: "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
            data: {
              coin: {value: "1000"},
              deposit_events: {
                guid: {id: {addr: otherAddr, creation_num: "2"}},
              },
              withdraw_events: {
                guid: {id: {addr: otherAddr, creation_num: "3"}},
              },
            },
          },
        } as unknown as Types.WriteSetChange,
        {
          type: "write_resource",
          address: POOL_ADDR,
          state_key_hash: "0x",
          data: {
            type: "0x1::stake::StakePool",
            data: {active: {value: "0"}},
          },
        } as unknown as Types.WriteSetChange,
      ],
      events: [
        {
          type: "0x1::coin::WithdrawEvent",
          guid: {account_address: DELEGATOR_ADDR, creation_number: "3"},
          sequence_number: "0",
          data: {amount: "1000"},
        },
        {
          type: "0x1::coin::DepositEvent",
          guid: {account_address: otherAddr, creation_number: "2"},
          sequence_number: "0",
          data: {amount: "1000"},
        },
      ],
    });

    expect(getCoinBalanceChangeForAccount(txn, POOL_ADDR)).toBe(BigInt(0));
  });
});

describe("getTransactionAmount", () => {
  it("returns the larger of deposits and withdrawals", () => {
    const txn = makeUserTransaction({
      changes: [
        {
          type: "write_resource",
          address: DELEGATOR_ADDR,
          state_key_hash: "0x",
          data: {
            type: "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
            data: {
              coin: {value: "0"},
              deposit_events: {
                guid: {id: {addr: DELEGATOR_ADDR, creation_num: "2"}},
              },
              withdraw_events: {
                guid: {id: {addr: DELEGATOR_ADDR, creation_num: "3"}},
              },
            },
          },
        } as unknown as Types.WriteSetChange,
      ],
      events: [
        {
          type: "0x1::coin::WithdrawEvent",
          guid: {account_address: DELEGATOR_ADDR, creation_number: "3"},
          sequence_number: "0",
          data: {amount: "5000000"},
        },
      ],
    });

    expect(getTransactionAmount(txn)).toBe(BigInt(5000000));
  });

  it("returns undefined for non-user transactions", () => {
    const txn = {
      type: "block_metadata_transaction",
      version: "1",
      hash: "0x",
      events: [],
      changes: [],
    } as unknown as Types.Transaction;

    expect(getTransactionAmount(txn)).toBe(undefined);
  });
});
