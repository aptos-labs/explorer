import React from "react";

import {useGetAccountResource} from "../../../../api/hooks/useGetAccountResource";
import LoadingModal from "../../components/LoadingModal";
import {Create} from "../Create";
import {Edit} from "../Edit";

type CreateOrEditProps = {
  isWalletConnected: boolean;
  accountAddress: string | null;
};
export function CreateOrEdit({
  isWalletConnected,
  accountAddress,
}: CreateOrEditProps) {
  const {
    accountResource: stakePool,
    isLoading,
    isError,
  } = useGetAccountResource(accountAddress || "0x1", "0x1::stake::StakePool");

  if (isLoading) return <LoadingModal open={isLoading} />;

  // handle errors
  if (isError) return <div>Error</div>;

  return (
    <>
      {stakePool ? (
        <Edit stakePool={stakePool} isWalletConnected={isWalletConnected} />
      ) : (
        <Create />
      )}
    </>
  );
}
