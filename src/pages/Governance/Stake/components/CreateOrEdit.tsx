import React, {useEffect, useState} from "react";
import {useGetAccountResource} from "../../../../api/hooks/useGetAccountResource";
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

  const {accountResource: stakePool, refetch} = useGetAccountResource(
    accountAddress || "0x1",
    "0x1::stake::StakePool",
  );

  useEffect(() => {
    setHasStakePool(!!stakePool);
  }, [stakePool]);

  const onCreateStackingPoolSuccess = () => {
    setHasStakePool(true);
    refetch();
  };

  if (stakePool && hasStakePool) {
    return <Edit stakePool={stakePool} isWalletConnected={isWalletConnected} />;
  } else {
    return <Create onCreateStackingPoolSuccess={onCreateStackingPoolSuccess} />;
  }
}
