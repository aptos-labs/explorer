import React from "react";

import {useGetAccountResource} from "../../../api/hooks/useGetAccountResource";
import {useWalletContext} from "../../../context/wallet/context";
import {Header} from "../components/Header";
import LoadingModal from "../components/LoadingModal";

import {Create} from "./Create";
import {Edit} from "./Edit";

export function Staking() {
  const {isConnected, accountAddress} = useWalletContext();
  const {accountResource: stakePool, isLoading} = useGetAccountResource(
    accountAddress || "0x1",
    "0x1::stake::StakePool",
  );

  if (isLoading) return <LoadingModal open={isLoading} />;

  return (
    <>
      <Header />
      {stakePool ? (
        <Edit stakePool={stakePool} isWalletConnected={isConnected} />
      ) : (
        <Create />
      )}
    </>
  );
}
