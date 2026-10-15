import {describe, expect, it} from "vitest";
import {ResponseErrorType} from "../../../api/client";
import {
  activityFromIndexer,
  displayedAccountData,
  positiveBalance,
  resolveAccountActivity,
  selectAccountPageError,
  statelessAccountData,
} from "./accountInfo";

const ADDRESS =
  "0x9c18ae5596581ba1e9308e32b24221845f6bc5e446d19ce3b962184d5761f372";

describe("FEAT-ACCOUNT-010 — stateless account info", () => {
  it("treats a positive fungible balance or a sent transaction as activity", () => {
    expect(positiveBalance("0")).toBe(false);
    expect(positiveBalance(0)).toBe(false);
    expect(positiveBalance("199500000")).toBe(true);

    expect(
      activityFromIndexer({
        balances: [{amount: 199500000}],
        sent: [],
      }),
    ).toEqual({holdsFunds: true, hasSentTransactions: false});

    expect(
      activityFromIndexer({
        balances: [{amount: "0"}],
        sent: [{version: 10}],
      }),
    ).toEqual({holdsFunds: false, hasSentTransactions: true});
  });

  it("uses the address as the auth key and sequence number 0", () => {
    // Covers FEAT-ACCOUNT-010 (AIP-115 defaults when Account resource is absent)
    expect(statelessAccountData(ADDRESS)).toEqual({
      sequence_number: "0",
      authentication_key: ADDRESS,
    });

    expect(
      displayedAccountData(ADDRESS, undefined, {
        holdsFunds: true,
        hasSentTransactions: false,
      }),
    ).toEqual({
      sequence_number: "0",
      authentication_key: ADDRESS,
    });

    expect(
      displayedAccountData(ADDRESS, undefined, {
        holdsFunds: false,
        hasSentTransactions: true,
      })?.sequence_number,
    ).toBe("0");
  });

  it("keeps the on-chain Account resource when it exists", () => {
    const onChain = {sequence_number: "4", authentication_key: "0xabc"};
    expect(
      displayedAccountData(ADDRESS, onChain, {
        holdsFunds: true,
        hasSentTransactions: true,
      }),
    ).toBe(onChain);
  });

  it("does not invent account info for an unused address", () => {
    expect(
      displayedAccountData(ADDRESS, undefined, {
        holdsFunds: false,
        hasSentTransactions: false,
      }),
    ).toBeUndefined();
    expect(displayedAccountData(ADDRESS, undefined, undefined)).toBeUndefined();
  });

  it("resolves as soon as the indexer shows funds, without waiting on APT", () => {
    const result = resolveAccountActivity({
      enabled: true,
      graphqlSupported: true,
      indexer: {holdsFunds: true, hasSentTransactions: false},
      indexerPending: false,
      indexerError: false,
      aptPending: true,
      restPending: false,
    });
    expect(result.pending).toBe(false);
    expect(result.activity).toEqual({
      holdsFunds: true,
      hasSentTransactions: false,
    });
  });

  it("waits for APT and REST when the indexer has no activity", () => {
    expect(
      resolveAccountActivity({
        enabled: true,
        graphqlSupported: true,
        indexer: {holdsFunds: false, hasSentTransactions: false},
        indexerPending: false,
        indexerError: false,
        aptPending: true,
        restPending: false,
      }).pending,
    ).toBe(true);

    expect(
      resolveAccountActivity({
        enabled: true,
        graphqlSupported: false,
        indexerPending: false,
        indexerError: false,
        aptBalance: "1",
        aptPending: false,
        restSent: false,
        restPending: false,
      }).activity,
    ).toEqual({holdsFunds: true, hasSentTransactions: false});
  });

  it("falls back to APT balance and REST sends when the indexer errors", () => {
    expect(
      resolveAccountActivity({
        enabled: true,
        graphqlSupported: true,
        indexerPending: false,
        indexerError: true,
        aptBalance: "0",
        aptPending: false,
        restSent: true,
        restPending: false,
      }).activity,
    ).toEqual({holdsFunds: false, hasSentTransactions: true});
  });
});

describe("FEAT-ACCOUNT-013 — missing Account resource is not a page error", () => {
  it("does not warn when resources are missing", () => {
    expect(
      selectAccountPageError({
        addressError: null,
        layoutError: null,
        resourceError: {
          type: ResponseErrorType.NOT_FOUND,
          message: "resource not found",
        },
      }),
    ).toBeNull();
    expect(
      selectAccountPageError({
        addressError: null,
        layoutError: null,
        resourceError: null,
      }),
    ).toBeNull();
  });

  it("still surfaces invalid addresses and hard failures", () => {
    const invalid = {
      type: ResponseErrorType.INVALID_INPUT,
      message: "bad",
    };
    expect(
      selectAccountPageError({
        addressError: invalid,
        layoutError: null,
        resourceError: null,
      }),
    ).toBe(invalid);

    const failed = {
      type: ResponseErrorType.UNHANDLED,
      message: "boom",
    };
    expect(
      selectAccountPageError({
        addressError: null,
        layoutError: failed,
        resourceError: null,
      }),
    ).toBe(failed);
    expect(
      selectAccountPageError({
        addressError: null,
        layoutError: null,
        resourceError: failed,
      }),
    ).toBe(failed);
  });
});
