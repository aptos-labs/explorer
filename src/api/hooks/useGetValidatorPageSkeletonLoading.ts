import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {useState, useEffect} from "react";

type useGetValidatorPageSkeletonLoadingResponse = {
  setIsMyDepositsSectionSkeletonLoading: (arg: boolean) => void;
  setIsStakingBarSkeletonLoading: (arg: boolean) => void;
  isSkeletonLoading: boolean;
};

export function useGetValidatorPageSkeletonLoading(): useGetValidatorPageSkeletonLoadingResponse {
  const {connected} = useWallet();
  const [
    isMyDepositsSectionSkeletonLoading,
    setIsMyDepositsSectionSkeletonLoading,
  ] = useState<boolean>(connected);
  const [isStakingBarSkeletonLoading, setIsStakingBarSkeletonLoading] =
    useState<boolean>(true);
  const [isSkeletonLoading, setIsSkeletonLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isMyDepositsSectionSkeletonLoading && !isStakingBarSkeletonLoading) {
      setIsSkeletonLoading(false);
    }
  }, [isMyDepositsSectionSkeletonLoading, isStakingBarSkeletonLoading]);

  return {
    setIsMyDepositsSectionSkeletonLoading,
    setIsStakingBarSkeletonLoading,
    isSkeletonLoading,
  };
}
