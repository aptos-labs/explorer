import {Box, Skeleton, Stack} from "@mui/material";
import * as React from "react";
import HashButton from "../../components/HashButton";
import ContentBox from "../../components/IndividualPageContent/ContentBox";
import ContentRowSpaceBetween from "../../components/IndividualPageContent/ContentRowSpaceBetween";
import {HashType} from "../../components/HashButton";
import RewardsPerformanceTooltip from "../Validators/Components/RewardsPerformanceTooltip";
import LastEpochPerformanceTooltip from "../Validators/Components/LastEpochPerformanceTooltip";
import {HexString, Types} from "aptos";
import {useEffect, useState} from "react";
import {useGetMainnetValidators} from "../../api/hooks/useGetMainnetValidators";
import TimeDurationIntervalBar from "./Components/TimeDurationIntervalBar";

type ValidatorDetailProps = {
  address: Types.Address;
  accountResource?: Types.MoveResource | undefined;
};

export default function ValidatorDetailCard({
  address,
  accountResource,
}: ValidatorDetailProps) {
  const addressHex = new HexString(address);
  const {validators} = useGetMainnetValidators();

  const validator = validators.find(
    (validator) => validator.owner_address === addressHex.hex(),
  );
  const [isSkeletonLoading, setIsSkeletonLoading] = useState<boolean>(true);

  const lockedUntilSecs = accountResource
    ? BigInt((accountResource.data as any).locked_until_secs)
    : null;
  const operatorAddr = validator?.operator_address;
  const rewardGrowth = validator?.rewards_growth;
  const stakePoolAddress = validator?.owner_address;

  useEffect(() => {
    if (lockedUntilSecs && operatorAddr && rewardGrowth && stakePoolAddress) {
      setIsSkeletonLoading(false);
    }
  }, [lockedUntilSecs, operatorAddr, rewardGrowth, stakePoolAddress]);

  // TODO: revisit layout for mobile
  return isSkeletonLoading ? (
    validatorDetailCardSkeleton()
  ) : (
    <Stack direction="row" spacing={4}>
      <ContentBox width="50%" marginTop={0}>
        <ContentRowSpaceBetween
          title={"Operator"}
          value={
            operatorAddr && (
              <HashButton hash={operatorAddr} type={HashType.ACCOUNT} />
            )
          }
        />
        <ContentRowSpaceBetween title="Number of Delegators" value={null} />
        <ContentRowSpaceBetween title="Compound Rewards" value={null} />
        <ContentRowSpaceBetween title="Operator Commission" value={null} />
      </ContentBox>
      <ContentBox width="50%" marginTop={0}>
        <ContentRowSpaceBetween
          title={"Stake Pool Address"}
          value={
            stakePoolAddress && (
              <HashButton hash={stakePoolAddress} type={HashType.ACCOUNT} />
            )
          }
        />
        <ContentRowSpaceBetween
          title="Rewards Performance"
          value={rewardGrowth ? `${rewardGrowth.toFixed(2)} %` : null}
          tooltip={<RewardsPerformanceTooltip />}
        />
        <ContentRowSpaceBetween
          title="Last Epoch Performance"
          value={validator ? validator.last_epoch_performance : null}
          tooltip={<LastEpochPerformanceTooltip />}
        />
        <ContentRowSpaceBetween
          title="Next Unlock"
          value={
            <TimeDurationIntervalBar timestamp={Number(lockedUntilSecs)} />
          }
        />
      </ContentBox>
    </Stack>
  );
}

// TODO: revisit skeleton for mobile
function validatorDetailCardSkeleton() {
  return (
    <Box display="flex">
      <ContentBox padding={4} width="50%">
        <Skeleton></Skeleton>
        <Skeleton></Skeleton>
        <Skeleton></Skeleton>
        <Skeleton></Skeleton>
      </ContentBox>
      <ContentBox padding={4} width="50%">
        <Skeleton></Skeleton>
        <Skeleton></Skeleton>
        <Skeleton></Skeleton>
        <Skeleton></Skeleton>
      </ContentBox>
    </Box>
  );
}
