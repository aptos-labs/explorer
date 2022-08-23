import React from "react";

import {useWalletContext} from "../../../context/wallet/context";
import {Header} from "../components/Header";
import {CreateOrEdit} from "./components/CreateOrEdit";

export function Staking() {
  const {isConnected, accountAddress} = useWalletContext();

  return (
    <>
      <Header />
      <CreateOrEdit
        isWalletConnected={isConnected}
        accountAddress={accountAddress}
      />
    </>
  );
}
