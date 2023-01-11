import {Box, Skeleton} from "@mui/material";
import * as React from "react";
import HashButton from "../../components/HashButton";
import ContentBox from "../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../components/IndividualPageContent/ContentRow";
import {HashType} from "../../components/HashButton";
import RewardsPerformanceTooltip from "../Validators/Components/RewardsPerformanceTooltip";
import LastEpochPerformanceTooltip from "../Validators/Components/LastEpochPerformanceTooltip";
import {prettifyTimestamp} from "../utils";
import {Types} from "aptos";
import {
  useGetMainnetValidators,
  useGetValidatorToOperator,
} from "../../api/hooks/useGetValidatorSet";
import {useGetAccountResource} from "../../api/hooks/useGetAccountResource";
import {ValidatorCardDetailName, validatorCardDetailType} from "./Constants";
import {useEffect, useState} from "react";

type ValidatorDetailProps = {
  address: Types.Address;
};

export default function ValidatorDetailCard({address}: ValidatorDetailProps) {
  // make sure that addresses will always start with "0x"
  const addressHex = address.startsWith("0x") ? address : "0x" + address;
  const {validators} = useGetMainnetValidators();
  const {isLoading, accountResource} = useGetAccountResource(
    addressHex,
    "0x1::stake::StakePool",
  );
  const validatorToOperator = useGetValidatorToOperator();
  const validator = validators.find(
    (validator) => validator.address === addressHex,
  );
  const sx = {display: "flex", justifyContent: "space-between"};
  const [isSkeletonLoading, setIsSkeletonLoading] = useState<boolean>(true);

  const lockedUntilSecs = accountResource
    ? BigInt((accountResource.data as any).locked_until_secs)
    : null;
  const operatorAddr = validatorToOperator
    ? validatorToOperator[addressHex]
    : null;
  const rewardGrowth = validator ? validator.rewards_growth : null;

  useEffect(() => {
    if (lockedUntilSecs && operatorAddr && rewardGrowth) {
      setIsSkeletonLoading(false);
    }
  }, [lockedUntilSecs, operatorAddr, rewardGrowth]);

  // TODO(jill): fill in card entry values
  const cardContent1 = {
    operator: operatorAddr ? (
      <HashButton hash={operatorAddr} type={HashType.ACCOUNT} />
    ) : null,
    numberOfDelegator: null,
    compoundRewards: null,
    operatorCommission: null,
    nextUnlockIn: prettifyTimestamp(Number(lockedUntilSecs)),
  };

  const cardContent2 = {
    nodeStarted: null,
    rewardsPerformance: rewardGrowth ? `${rewardGrowth.toFixed(2)} %` : null,
    lastEpochPerformance: validator ? validator.last_epoch_performance : null,
    lastEpochDepositTotal: null,
    lastEpochWithdrawTotal: null,
  };

  // TODO(jill): add tooltips for each card entry detail
  function getCardTooltip(entry: string): JSX.Element | undefined {
    switch (entry) {
      case validatorCardDetailType.rewardsPerformance:
        return <RewardsPerformanceTooltip />;
      case validatorCardDetailType.lastEpochPerformance:
        return <LastEpochPerformanceTooltip />;
      case validatorCardDetailType.operator:
      case validatorCardDetailType.numberOfDelegator:
      case validatorCardDetailType.compoundRewards:
      case validatorCardDetailType.operatorCommission:
      case validatorCardDetailType.nextUnlockIn:
      case validatorCardDetailType.nodeStarted:
      case validatorCardDetailType.lastEpochDepositTotal:
      case validatorCardDetailType.lastEpochWithdrawTotal:
      default:
        return undefined;
    }
  }

  return (
    <Box display="flex">
      {[cardContent1, cardContent2].map((card, index) => (
        <ContentBox width={"50%"} marginRight={index === 0 ? 2 : 0}>
          {Object.entries(card).map(([key, value]) =>
            isSkeletonLoading ? (
              <Skeleton></Skeleton>
            ) : (
              <ContentRow
                container={false}
                sx={sx}
                title={validatorCardDetailType[key as ValidatorCardDetailName]}
                value={value}
                tooltip={getCardTooltip(
                  validatorCardDetailType[key as ValidatorCardDetailName],
                )}
              />
            ),
          )}
        </ContentBox>
      ))}
    </Box>
  );
}
