import React, {useEffect, useState} from "react";
import {useGetAccountResource} from "../../../api/hooks/useGetAccountResource";
import LoadingModal from "../../../components/LoadingModal";
import {Create} from "../Create";
import {Edit} from "../Edit";
import {Alert} from "@mui/material";
import {useGlobalState} from "../../../GlobalState";

type CreateOrEditProps = {
  isWalletConnected: boolean;
  accountAddress: string | null;
};
export function CreateOrEdit({
  isWalletConnected,
  accountAddress,
}: CreateOrEditProps): JSX.Element {
  const [state, _] = useGlobalState();
  const [hasStakePool, setHasStakePool] = useState<boolean>(false);

  const {
    accountResource: stakePool,
    isLoading,
    isError,
    refetch,
  } = useGetAccountResource(accountAddress || "0x1", "0x1::stake::StakePool");

  useEffect(() => {
    setHasStakePool(!!stakePool);
  }, [stakePool]);

  const onCreateStackingPoolSuccess = () => {
    setHasStakePool(true);
    refetch();
  };

  if (isLoading) {
    return <LoadingModal open={isLoading} />;
  }

  if (isError) {
    return (
      <Alert severity="error">
        {`Account ${accountAddress} is not found in the current network "${state.network_name}". Please switch to your owner account in the wallet.`}
      </Alert>
    );
  }

  if (stakePool && hasStakePool) {
    return <Edit stakePool={stakePool} isWalletConnected={isWalletConnected} />;
  } else {
    return <Create onCreateStackingPoolSuccess={onCreateStackingPoolSuccess} />;
  }
}
