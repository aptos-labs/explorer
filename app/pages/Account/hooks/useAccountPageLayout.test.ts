import {describe, expect, it} from "vitest";
import type {Types} from "~/types/aptos";
import {ResponseErrorType} from "../../../api/client";
import {
  isNotFoundOnNetwork,
  type LayoutResourceQuery,
  mapAccountLayoutQueries,
  shouldRedirectAccountToObject,
} from "./useAccountPageLayout";

function query(
  overrides: Partial<LayoutResourceQuery> = {},
): LayoutResourceQuery {
  return {
    data: undefined,
    isPending: false,
    isError: false,
    error: null,
    isFetched: true,
    ...overrides,
  };
}

function resource(type: string): Types.MoveResource {
  return {type, data: {ok: true}} as Types.MoveResource;
}

describe("FEAT-ACCOUNT-013 — mapAccountLayoutQueries", () => {
  it("treats 404s as absent resources, not page errors", () => {
    const layout = mapAccountLayoutQueries(
      {
        account: query({
          isError: true,
          error: {type: ResponseErrorType.NOT_FOUND},
        }),
        object: query({
          isError: true,
          error: new Error("Aptos API error 404: missing"),
        }),
        token: query({
          isError: true,
          error: {status: 404},
        }),
        multisig: query({
          isError: true,
          error: {type: ResponseErrorType.NOT_FOUND},
        }),
      },
      true,
    );

    expect(layout.isAccount).toBe(false);
    expect(layout.isObject).toBe(false);
    expect(layout.isToken).toBe(false);
    expect(layout.isMultisig).toBe(false);
    expect(layout.error).toBeNull();
    expect(layout.isFetched).toBe(true);
    expect(layout.isPending).toBe(false);
  });

  it("surfaces non-404 failures as layout errors", () => {
    const layout = mapAccountLayoutQueries(
      {
        account: query({
          isError: true,
          error: {type: ResponseErrorType.UNHANDLED, message: "boom"},
        }),
        object: query(),
        token: query(),
        multisig: query(),
      },
      true,
    );
    expect(layout.error).toEqual({
      type: ResponseErrorType.UNHANDLED,
      message: "boom",
    });
  });

  it("derives account / object / token / multisig flags from hits", () => {
    const layout = mapAccountLayoutQueries(
      {
        account: query({
          data: {
            type: "0x1::account::Account",
            data: {sequence_number: "3", authentication_key: "0xabc"},
          } as Types.MoveResource,
        }),
        object: query({data: resource("0x1::object::ObjectCore")}),
        token: query({data: resource("0x4::token::Token")}),
        multisig: query({
          data: resource("0x1::multisig_account::MultisigAccount"),
        }),
      },
      true,
    );

    expect(layout.isAccount).toBe(true);
    expect(layout.isObject).toBe(true);
    expect(layout.isToken).toBe(true);
    expect(layout.isMultisig).toBe(true);
    expect(layout.accountData).toEqual({
      sequence_number: "3",
      authentication_key: "0xabc",
    });
  });

  it("is not fetched or pending when no address is available yet", () => {
    const layout = mapAccountLayoutQueries(
      {
        account: query({isPending: true, isFetched: false}),
        object: query({isPending: true, isFetched: false}),
        token: query({isPending: true, isFetched: false}),
        multisig: query({isPending: true, isFetched: false}),
      },
      false,
    );
    expect(layout.isPending).toBe(false);
    expect(layout.isFetched).toBe(false);
  });
});

describe("FEAT-ACCOUNT-004 — shouldRedirectAccountToObject", () => {
  it("redirects only after layout is known for a pure object", () => {
    expect(shouldRedirectAccountToObject(false, true, false, true)).toBe(true);
  });

  it("does not redirect while layout is still loading", () => {
    expect(shouldRedirectAccountToObject(false, true, false, false)).toBe(
      false,
    );
  });

  it("does not redirect accounts that also have ObjectCore", () => {
    expect(shouldRedirectAccountToObject(false, true, true, true)).toBe(false);
  });

  it("does not redirect when already on the object route", () => {
    expect(shouldRedirectAccountToObject(true, true, false, true)).toBe(false);
  });
});

describe("FEAT-ACCOUNT-014 — isNotFoundOnNetwork", () => {
  it("flags a fetched layout with no resources at all", () => {
    const layout = mapAccountLayoutQueries(
      {
        account: query(),
        object: query(),
        token: query(),
        multisig: query(),
      },
      true,
    );
    // An address absent everywhere on this network (e.g. a mainnet object
    // opened on testnet) must read "not found", never "deleted".
    expect(isNotFoundOnNetwork(layout)).toBe(true);
  });

  it("does not flag an address that still has any resource", () => {
    const withAccount = mapAccountLayoutQueries(
      {
        account: query({data: resource("0x1::account::Account")}),
        object: query(),
        token: query(),
        multisig: query(),
      },
      true,
    );
    expect(isNotFoundOnNetwork(withAccount)).toBe(false);

    const withObject = mapAccountLayoutQueries(
      {
        account: query(),
        object: query({data: resource("0x1::object::ObjectCore")}),
        token: query(),
        multisig: query(),
      },
      true,
    );
    expect(isNotFoundOnNetwork(withObject)).toBe(false);
  });

  it("does not flag when a probe hit a non-404 error", () => {
    const layout = mapAccountLayoutQueries(
      {
        account: query(),
        object: query({
          isError: true,
          error: {type: ResponseErrorType.TOO_MANY_REQUESTS},
        }),
        token: query(),
        multisig: query(),
      },
      true,
    );
    // A rate limit or outage is not evidence the address is absent.
    expect(layout.error).not.toBeNull();
    expect(isNotFoundOnNetwork(layout)).toBe(false);
  });

  it("does not flag while the layout is still fetching", () => {
    const layout = mapAccountLayoutQueries(
      {
        account: query({isPending: true, isFetched: false}),
        object: query(),
        token: query(),
        multisig: query(),
      },
      true,
    );
    expect(isNotFoundOnNetwork(layout)).toBe(false);
  });
});
