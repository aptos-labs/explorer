// @vitest-environment jsdom
// Covers FEAT-WALLET-001 — wallet adapter loads on demand, auto-connect still loads it
import type {WalletContextState} from "@aptos-labs/wallet-adapter-react";
import {act, cleanup, render, screen} from "@testing-library/react";
import {useEffect} from "react";
import {afterEach, describe, expect, it, vi} from "vitest";
import {
  ADAPTER_WALLET_NAME_STORAGE_KEY,
  WalletAdapterProvider,
} from "./WalletAdapterProvider";
import {useWallet, useWalletAdapterLoader} from "./walletContext";

const networkName = vi.hoisted(() => ({current: "mainnet"}));
const adapterMounts = vi.hoisted(() => ({networks: [] as string[]}));

vi.mock("../../global-config", () => ({
  useNetworkName: () => networkName.current,
}));

vi.mock("./LoadedWalletAdapter", () => ({
  default: function FakeLoadedWalletAdapter({
    networkName,
    onStateChange,
  }: {
    networkName: string;
    onStateChange: (state: WalletContextState) => void;
  }) {
    useEffect(() => {
      adapterMounts.networks.push(networkName);
      onStateChange({
        connected: true,
        account: {address: `0x${networkName}`},
      } as unknown as WalletContextState);
    }, [networkName, onStateChange]);
    return null;
  },
}));

let loadAdapter: () => void = () => {};

function Probe() {
  const {connected, account, signAndSubmitTransaction} = useWallet();
  const {ready, load} = useWalletAdapterLoader();
  loadAdapter = load;
  return (
    <div>
      <span data-testid="ready">{String(ready)}</span>
      <span data-testid="connected">{String(connected)}</span>
      <span data-testid="account">
        {account?.address?.toString() ?? "none"}
      </span>
      <button
        type="button"
        onClick={() => {
          signAndSubmitTransaction({} as never).catch((e: Error) => {
            document.title = e.message;
          });
        }}
      >
        sign
      </button>
    </div>
  );
}

function renderProvider() {
  return render(
    <WalletAdapterProvider>
      <Probe />
    </WalletAdapterProvider>,
  );
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  adapterMounts.networks = [];
  networkName.current = "mainnet";
  document.title = "";
});

describe("FEAT-WALLET-001 — lazy wallet adapter", () => {
  it("reports a disconnected wallet and does not load the adapter until asked", async () => {
    renderProvider();
    await act(async () => {});

    expect(screen.getByTestId("ready").textContent).toBe("false");
    expect(screen.getByTestId("connected").textContent).toBe("false");
    expect(adapterMounts.networks).toEqual([]);

    await act(async () => {
      screen.getByRole("button", {name: "sign"}).click();
    });
    expect(document.title).toBe("Wallet adapter is not loaded");
  });

  it("loads the adapter on request and mirrors its state", async () => {
    renderProvider();
    await act(async () => loadAdapter());

    expect(await screen.findByText("0xmainnet")).toBeTruthy();
    expect(screen.getByTestId("ready").textContent).toBe("true");
    expect(screen.getByTestId("connected").textContent).toBe("true");
    expect(adapterMounts.networks).toEqual(["mainnet"]);
  });

  it("loads the adapter after hydration when a wallet was connected before", async () => {
    localStorage.setItem(ADAPTER_WALLET_NAME_STORAGE_KEY, '"Petra"');
    renderProvider();

    expect(await screen.findByText("0xmainnet")).toBeTruthy();
    expect(adapterMounts.networks).toEqual(["mainnet"]);
  });

  it("hands the new network to the adapter without remounting the app", async () => {
    const {rerender} = renderProvider();
    await act(async () => loadAdapter());
    await screen.findByText("0xmainnet");
    const probe = screen.getByTestId("account");

    networkName.current = "testnet";
    rerender(
      <WalletAdapterProvider>
        <Probe />
      </WalletAdapterProvider>,
    );

    expect(await screen.findByText("0xtestnet")).toBeTruthy();
    expect(screen.getByTestId("account")).toBe(probe);
  });
});
