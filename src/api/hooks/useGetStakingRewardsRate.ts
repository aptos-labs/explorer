import {useViewFunction} from "./useViewFunction";

export function useGetStakingRewardsRate() {
  const response = useViewFunction("0x1::staking_config::reward_rate", [], []);
  if (response.data && response.data.length == 2) {
    const [numerator, denominator] = response.data;
    // TODO: Note, that if the epoch length changes, this changes.
    // 4380 is 2 hour epochs, 12 times a day for 365 days
    const rate =
      (100 * 4380 * parseInt(numerator as string)) /
      parseInt(denominator as string);

    return {...response, rewardsRateYearly: rate.toPrecision(4)};
  } else {
    return {...response, rewardsRateYearly: "N/A"};
  }
}
