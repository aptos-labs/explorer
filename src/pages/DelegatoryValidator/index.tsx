import {Grid} from "@mui/material";
import * as React from "react";
import {useParams} from "react-router-dom";
import PageHeader from "../layout/PageHeader";
import ValidatorTitle from "./Title";
import ValidatorDetailCard from "./DetailCard";
import ValidatorStakingBar from "./StakingBar";
import {HexString} from "aptos";
import {useGetMainnetValidators} from "../../api/hooks/useGetMainnetValidators";
import MyDepositsSection from "./MyDepositsSection";
import {useGetAccountResource} from "../../api/hooks/useGetAccountResource";

export default function ValidatorPage() {
  const address = useParams().address ?? "";
  const addressHex = new HexString(address);
  const {validators} = useGetMainnetValidators();
  const validator = validators.find(
    (validator) => validator.owner_address === addressHex.hex(),
  );
  const {accountResource} = useGetAccountResource(
    addressHex.hex(),
    "0x1::stake::StakePool",
  );

  if (!validator) {
    return null;
  }

  return (
    <Grid spacing={1}>
      <Grid item xs={12} md={12} lg={12}>
        <PageHeader />
      </Grid>
      <Grid paddingBottom={4}>
        <ValidatorTitle address={address} />
      </Grid>
      <ValidatorStakingBar
        validator={validator}
        accountResource={accountResource}
      />
      <ValidatorDetailCard
        address={address}
        accountResource={accountResource}
      />
      <Grid paddingTop={4}>
        <MyDepositsSection accountResource={accountResource} />
      </Grid>
    </Grid>
  );
}
