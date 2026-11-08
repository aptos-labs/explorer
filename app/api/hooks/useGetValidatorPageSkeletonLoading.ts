import {useState} from "react";
import {useWallet} from "../../context/wallet-adapter";

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

  // Calculate isSkeletonLoading during render instead of using useEffect
  const isSkeletonLoading =
    isMyDepositsSectionSkeletonLoading || isStakingBarSkeletonLoading;

  return {
    setIsMyDepositsSectionSkeletonLoading,
    setIsStakingBarSkeletonLoading,
    isSkeletonLoading,
  };
}
