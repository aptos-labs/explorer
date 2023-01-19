import React from "react";
import {useState} from "react";
import WalletButton from "./WalletButton";
import WalletsModal from "./WalletModel";

export default function WalletConnector() {
  const [modalOpen, setModalOpen] = useState(false);
  const handleModalOpen = () => setModalOpen(true);
  const handleClose = () => setModalOpen(false);

  return (
    <>
      <WalletButton handleModalOpen={handleModalOpen} />
      <WalletsModal handleClose={handleClose} modalOpen={modalOpen} />
    </>
  );
}
