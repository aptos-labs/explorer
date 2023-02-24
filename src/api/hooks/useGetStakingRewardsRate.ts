import {useGlobalState} from "../../GlobalState";
import {useEffect, useMemo, useState} from "react";
import {useGetAccountResource} from "./useGetAccountResource";
import {useGetEpochTime} from "./useGetEpochTime";

interface ConfigurationData {
  rewards_rate: string;
  rewards_rate_denominator: string;
}

function useGetStakingConfig() {
  const [state, _] = useGlobalState();
  const [rewardsRatePerEpoch, setRewardsRatePerEpoch] = useState<string>();
  const [rewardsRateDenominator, setRewardsRateDenominator] =
    useState<string>();

  const {data: configuration} = useGetAccountResource(
    "0x1",
    "0x1::staking_config::StakingConfig",
  );

  useEffect(() => {
    if (configuration?.data !== undefined) {
      const data = configuration.data as ConfigurationData;
      setRewardsRatePerEpoch(data.rewards_rate);
      setRewardsRateDenominator(data.rewards_rate_denominator);
    }
  }, [configuration?.data, state]);

  return {rewardsRatePerEpoch, rewardsRateDenominator};
}

export function useGetStakingRewardsRate() {
  const {epochInterval} = useGetEpochTime();
  const {rewardsRatePerEpoch, rewardsRateDenominator} = useGetStakingConfig();
  const [rewardsRateYearly, setRewardsRateYearly] = useState<string>();

  useMemo(() => {
    if (
      epochInterval !== undefined &&
      rewardsRatePerEpoch !== undefined &&
      rewardsRateDenominator !== undefined
    ) {
      const ratePerEpoch = parseInt(rewardsRatePerEpoch);
      const denominator = parseInt(rewardsRateDenominator);

      const epochInSec = parseInt(epochInterval) / 1000 / 1000;
      const yearInSec = 60 * 60 * 24 * 365;
      const epochsPerYear = yearInSec / epochInSec;

      const rate = (
        ((ratePerEpoch * epochsPerYear) / denominator) *
        100
      ).toFixed(0);
      setRewardsRateYearly(rate);
    }
  }, [epochInterval, rewardsRatePerEpoch, rewardsRateDenominator]);

  return {rewardsRateYearly};
}
