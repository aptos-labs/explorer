import {Grid} from "@mui/material";
import * as React from "react";
import {useParams} from "react-router-dom";
import PageHeader from "../layout/PageHeader";
import ValidatorTitle from "./Title";
import ValidatorDetailCard from "./DetailCard";
import ValidatorStakingBar from "./StakingBar";
import {useGetMainnetValidators} from "../../api/hooks/useGetValidatorSet";
import {HexString} from "aptos";

export default function ValidatorPage() {
  const address = useParams().address ?? "";
  const addressHex = new HexString(address);
  const {validators} = useGetMainnetValidators();
  const validator = validators.find(
    (validator) => validator.address === addressHex.hex(),
  );

  if (!validator) {
    return null;
  }

  return (
    <Grid spacing={1}>
      <Grid item xs={12} md={12} lg={12}>
        <PageHeader />
      </Grid>
      <ValidatorTitle address={address} />
      <ValidatorStakingBar validator={validator} />
      <ValidatorDetailCard
        validator={validator}
        addressHex={addressHex.hex()}
      />
    </Grid>
  );
}
