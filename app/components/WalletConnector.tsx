import {WalletSortingOptions} from "@aptos-labs/wallet-adapter-react";
import {Breakpoint} from "@mui/material";
import {useState} from "react";
import WalletButton from "./WalletButton";
import WalletsModal from "./WalletModel";

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
  const [modalOpen, setModalOpen] = useState(false);
  const handleModalOpen = () => setModalOpen(true);
  const handleClose = () => setModalOpen(false);

  return (
    <>
      <WalletButton
        handleModalOpen={handleModalOpen}
        handleNavigate={handleNavigate}
      />
      <WalletsModal
        handleClose={handleClose}
        modalOpen={modalOpen}
        networkSupport={networkSupport}
        modalMaxWidth={modalMaxWidth}
        {...walletSortingOptions}
      />
    </>
  );
}
