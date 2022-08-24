import React, {useEffect, useState} from "react";

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
}: CreateOrEditProps): JSX.Element {
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

  const onCreateStackingPool = () => {
    setHasStakePool(true);
    refetch();
  };

  if (isLoading) return <LoadingModal open={isLoading} />;

  // handle errors
  if (isError) return <div>Error</div>;

  if (stakePool && hasStakePool)
    return <Edit stakePool={stakePool} isWalletConnected={isWalletConnected} />;

  return <Create onCreateStackingPool={onCreateStackingPool} />;
}
