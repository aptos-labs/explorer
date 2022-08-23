import React from "react";

import {useWalletContext} from "../../../context/wallet/context";
import {Header} from "../components/Header";
import {EditContent} from "./components/EditContent";

export function Staking() {
  const {isConnected, accountAddress} = useWalletContext();

  return (
    <>
      <Header />
      <EditContent
        isWalletConnected={isConnected}
        accountAddress={accountAddress}
      />
    </>
  );
}
