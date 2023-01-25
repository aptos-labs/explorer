import {Box, Skeleton} from "@mui/material";
import * as React from "react";
import HashButton from "../../components/HashButton";
import ContentBox from "../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../components/IndividualPageContent/ContentRow";
import {HashType} from "../../components/HashButton";
import RewardsPerformanceTooltip from "../Validators/Components/RewardsPerformanceTooltip";
import LastEpochPerformanceTooltip from "../Validators/Components/LastEpochPerformanceTooltip";
import {HexString, Types} from "aptos";
import {useEffect, useState} from "react";
import TimestampValue from "../../components/IndividualPageContent/ContentValue/TimestampValue";
import {useGetMainnetValidators} from "../../api/hooks/useGetMainnetValidators";

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
  const sx = {justifyContent: "space-between", display: "flex"};

  useEffect(() => {
    if (lockedUntilSecs && operatorAddr && rewardGrowth && stakePoolAddress) {
      setIsSkeletonLoading(false);
    }
  }, [lockedUntilSecs, operatorAddr, rewardGrowth, stakePoolAddress]);

  return isSkeletonLoading ? (
    validatorDetailCardSkeleton()
  ) : (
    <Box display="flex">
      <ContentBox padding={4} width="50%" marginRight={3}>
        <ContentRow
          title={"Operator"}
          value={
            operatorAddr && (
              <HashButton hash={operatorAddr} type={HashType.ACCOUNT} />
            )
          }
        />
        <ContentRow title="Number of Delegators" value={null} />
        <ContentRow title="Compound Rewards" value={null} />
        <ContentRow title="Operator Commission" value={null} />
      </ContentBox>
      <ContentBox padding={4} width="50%">
        <ContentRow
          title={"Stake Pool Address"}
          value={
            stakePoolAddress && (
              <HashButton hash={stakePoolAddress} type={HashType.ACCOUNT} />
            )
          }
        />
        <ContentRow
          title="Rewards Performance"
          value={rewardGrowth ? `${rewardGrowth.toFixed(2)} %` : null}
          tooltip={<RewardsPerformanceTooltip />}
        />
        <ContentRow
          title="Last Epoch Performance"
          value={validator ? validator.last_epoch_performance : null}
          tooltip={<LastEpochPerformanceTooltip />}
        />
        <ContentRow
          title="Next Unlock"
          value={<TimestampValue timestamp={lockedUntilSecs?.toString()!} />}
        />
      </ContentBox>
    </Box>
  );
}

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
