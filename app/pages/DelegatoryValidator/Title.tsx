import {Stack, Typography, Skeleton} from "@mui/material";
import {Types} from "aptos";
import TitleHashButton, {HashType} from "../../components/TitleHashButton";
import ValidatorStatusIcon from "./Components/ValidatorStatusIcon";
import {useGetDelegationNodeInfo} from "../../api/hooks/delegations";
import {getValidatorStatus} from "./utils";
import {PageMetadata} from "../../components/hooks/usePageMetadata";

type ValidatorTitleProps = {
  address: Types.Address;
  isSkeletonLoading: boolean;
};

export default function ValidatorTitle({
  address,
  isSkeletonLoading,
}: ValidatorTitleProps) {
  const {validatorStatus} = useGetDelegationNodeInfo({
    validatorAddress: address,
  });

  const shortAddress = `${address.slice(0, 10)}...${address.slice(-8)}`;
  const statusText = validatorStatus
    ? getValidatorStatus(Number(validatorStatus[0]))
    : "unknown";

  return isSkeletonLoading ? (
    ValidatorTitleSkeleton()
  ) : (
    <Stack direction="column" spacing={4} marginX={1}>
      <PageMetadata
        title={`Validator ${shortAddress}`}
        description={`View Aptos validator ${shortAddress}. Status: ${statusText}. See delegation pool, commission rates, stake amounts, voting power, rewards, and performance metrics.`}
        type="validator"
        keywords={[
          "validator",
          "staking",
          "delegation",
          "APT",
          "proof of stake",
          "rewards",
        ]}
        canonicalPath={`/validator/${address}`}
      />
      <Typography variant="h3">Validator</Typography>
      <Stack direction="row" spacing={1}>
        <TitleHashButton hash={address} type={HashType.ACCOUNT} isValidator />
        <ValidatorStatusIcon
          validatorStatus={
            validatorStatus
              ? getValidatorStatus(Number(validatorStatus[0]))
              : undefined
          }
        />
      </Stack>
    </Stack>
  );
}

function ValidatorTitleSkeleton() {
  return (
    <Stack>
      <Skeleton height={60}></Skeleton>
      <Skeleton height={40}></Skeleton>
    </Stack>
  );
}
