import {Stack, Typography, Skeleton} from "@mui/material";
import {Types} from "aptos";
import TitleHashButton, {HashType} from "../../components/TitleHashButton";
import ValidatorStatusIcon from "./Components/ValidatorStatusIcon";
import {useGetDelegationNodeInfo} from "../../api/hooks/delegations";
import {getValidatorStatus} from "./utils";
import {usePageMetadata} from "../../components/hooks/usePageMetadata";

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

  usePageMetadata({title: `Delegating Validator ${address}`});
  return isSkeletonLoading ? (
    ValidatorTitleSkeleton()
  ) : (
    <Stack direction="column" spacing={4} marginX={1}>
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
