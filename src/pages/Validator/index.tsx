import {Grid} from "@mui/material";
import * as React from "react";
import {useParams} from "react-router-dom";
import PageHeader from "../layout/PageHeader";
import ValidatorTitle from "./Title";
import ValidatorDetailCard from "./DetailCard";
import ValidatorStakingBar from "./StakingBar";
import {HexString} from "aptos";
import {useGetMainnetValidators} from "../../api/hooks/useGetMainnetValidators";

export default function ValidatorPage() {
  const address = useParams().address ?? "";
  const addressHex = new HexString(address);
  const {validators} = useGetMainnetValidators();
  const validator = validators.find(
    (validator) => validator.owner_address === addressHex.hex(),
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
      <ValidatorDetailCard address={addressHex.hex()} />
    </Grid>
  );
}
