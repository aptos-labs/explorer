// @vitest-environment jsdom
// Covers FEAT-VALDEL-002 — skip commission-change view calls without an address
import {renderHook} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";

const useQueryMock = vi.hoisted(() =>
  vi.fn((_options?: unknown) => ({
    data: undefined,
    isLoading: false,
    error: null,
  })),
);

vi.mock("@tanstack/react-query", () => ({
  useQuery: (options: unknown) => useQueryMock(options),
}));

vi.mock("../../../global-config", () => ({
  useAptosClient: () => ({id: "client"}),
}));

vi.mock("../..", () => ({
  getValidatorCommissionChange: vi.fn(),
}));

import {useGetDelegationNodeCommissionChange} from "./useGetDelegationNodeCommissionChange";

describe("useGetDelegationNodeCommissionChange", () => {
  it("disables the query when the validator address is empty", () => {
    useQueryMock.mockClear();
    renderHook(() =>
      useGetDelegationNodeCommissionChange({validatorAddress: ""}),
    );
    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({enabled: false}),
    );
  });

  it("enables the query when the validator address is present", () => {
    useQueryMock.mockClear();
    renderHook(() =>
      useGetDelegationNodeCommissionChange({
        validatorAddress:
          "0x890c86c19974b98594a4e5cd7b0b3a69af1b30afc78853a0c11e882801497320",
      }),
    );
    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({enabled: true}),
    );
  });
});
