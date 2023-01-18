import {Box, Skeleton} from "@mui/material";
import * as React from "react";
import HashButton from "../../components/HashButton";
import ContentBox from "../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../components/IndividualPageContent/ContentRow";
import {HashType} from "../../components/HashButton";
import RewardsPerformanceTooltip from "../Validators/Components/RewardsPerformanceTooltip";
import LastEpochPerformanceTooltip from "../Validators/Components/LastEpochPerformanceTooltip";
import {Types} from "aptos";
import {useGetAccountResource} from "../../api/hooks/useGetAccountResource";
import {useEffect, useState} from "react";
import TimestampValue from "../../components/IndividualPageContent/ContentValue/TimestampValue";
import {useGetMainnetValidators} from "../../api/hooks/useGetMainnetValidators";

type ValidatorDetailProps = {
  address: Types.Address;
};

export default function ValidatorDetailCard({address}: ValidatorDetailProps) {
  // make sure that addresses will always start with "0x"
  const addressHex = address.startsWith("0x") ? address : "0x" + address;
  const {validators} = useGetMainnetValidators();
  const {accountResource} = useGetAccountResource(
    addressHex,
    "0x1::stake::StakePool",
  );

  const validator = validators.find(
    (validator) => validator.owner_address === addressHex,
  );
  const [isSkeletonLoading, setIsSkeletonLoading] = useState<boolean>(true);

  const lockedUntilSecs = accountResource
    ? BigInt((accountResource.data as any).locked_until_secs)
    : null;
  const operatorAddr = validator?.operator_address;
  const rewardGrowth = validator?.rewards_growth;

  useEffect(() => {
    if (lockedUntilSecs && operatorAddr && rewardGrowth) {
      setIsSkeletonLoading(false);
    }
  }, [lockedUntilSecs, operatorAddr, rewardGrowth]);

  return isSkeletonLoading ? (
    validatorDetailCardSkeleton()
  ) : (
    <Box display="flex">
      <ContentBox padding={4} width="50%">
        <ContentRow
          title={"Operator"}
          value={
            operatorAddr ? (
              <HashButton hash={operatorAddr} type={HashType.ACCOUNT} />
            ) : null
          }
        />
        <ContentRow title="Number of delegator" value={null} />
        <ContentRow title="Compound rewards" value={null} />
        <ContentRow title="Operator commission" value={null} />
        <ContentRow
          title="Next unlock in"
          value={<TimestampValue timestamp={lockedUntilSecs?.toString()!} />}
        />
      </ContentBox>
      <ContentBox padding={4} width="50%">
        <ContentRow title={"Node started"} value={null} />
        <ContentRow
          title="Rewards Performance"
          value={rewardGrowth ? `${rewardGrowth.toFixed(2)} %` : null}
          tooltip={<RewardsPerformanceTooltip />}
        />
        <ContentRow
          title="Last epoch performance"
          value={validator ? validator.last_epoch_performance : null}
          tooltip={<LastEpochPerformanceTooltip />}
        />
        <ContentRow title="Last epoch deposit total" value={null} />
        <ContentRow title="Last epoch withdraw total" value={null} />
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
