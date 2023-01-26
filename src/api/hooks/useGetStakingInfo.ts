import {useMemo, useState} from "react";
import {MainnetValidatorData} from "./useGetMainnetValidators";
import {useGetValidatorSet, Validator} from "./useGetValidatorSet";

type useGetStakingInfoResponse = {
  delegatedStakeAmount: string;
  networkPercentage?: string;
};

type useGetStakingInfoProps = {
  validator: MainnetValidatorData | Validator;
};
export function useGetStakingInfo({
  validator,
}: useGetStakingInfoProps): useGetStakingInfoResponse {
  /* TO BE ADDED (jill)
        
        commission
        num of delegators
        total rewards earned per validator

        my delegation history:
            amount
            status
            rewards earned
    */

  const {totalVotingPower} = useGetValidatorSet();
  const [networkPercentage, setNetworkPercentage] = useState<string>();

  useMemo(() => {
    setNetworkPercentage(
      (
        (parseInt(validator.voting_power) / parseInt(totalVotingPower!)) *
        100
      ).toFixed(2),
    );
  }, [totalVotingPower]);

  return {
    networkPercentage,
    delegatedStakeAmount: validator.voting_power,
  };
}
