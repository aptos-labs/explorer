import type {WalletSortingOptions} from "@aptos-labs/wallet-adapter-react";
import type {Breakpoint} from "@mui/material";
import {lazy, Suspense, useState} from "react";
import {useWalletAdapterLoader} from "../context/wallet-adapter";
import WalletButton from "./WalletButton";

const WalletsModal = lazy(() => import("./WalletModel"));

export interface WalletConnectorProps extends WalletSortingOptions {
  networkSupport?: string;
  handleNavigate?: () => void;
  /** The max width of the wallet selector modal. Defaults to `xs`. */
  modalMaxWidth?: Breakpoint;
}

export function WalletConnector({
  networkSupport,
  handleNavigate,
  modalMaxWidth,
  ...walletSortingOptions
}: WalletConnectorProps) {
  const {load: loadWalletAdapter} = useWalletAdapterLoader();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRequested, setModalRequested] = useState(false);
  const handleModalOpen = () => {
    loadWalletAdapter();
    setModalRequested(true);
    setModalOpen(true);
  };
  const handleClose = () => setModalOpen(false);

  return (
    <>
      <WalletButton
        handleModalOpen={handleModalOpen}
        handleNavigate={handleNavigate}
      />
      {modalRequested ? (
        <Suspense fallback={null}>
          <WalletsModal
            handleClose={handleClose}
            modalOpen={modalOpen}
            networkSupport={networkSupport}
            modalMaxWidth={modalMaxWidth}
            {...walletSortingOptions}
          />
        </Suspense>
      ) : null}
    </>
  );
}
