import {Grid, Stack} from "@mui/material";
import * as React from "react";
import {useParams} from "react-router-dom";
import PageHeader from "../layout/PageHeader";
import ValidatorTitle from "./Title";
import ValidatorDetailCard from "./DetailCard";
import ValidatorStakingBar from "./StakingBar";
import {HexString} from "aptos";
import {useGetValidators} from "../../api/hooks/useGetValidators";
import MyDepositsSection from "./MyDepositsSection";
import {useGetAccountResource} from "../../api/hooks/useGetAccountResource";
import {useWallet} from "@aptos-labs/wallet-adapter-react";

export default function ValidatorPage() {
  const address = useParams().address ?? "";
  const addressHex = new HexString(address);
  const {validators} = useGetValidators();
  const {connected} = useWallet();
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
    <Grid container spacing={1}>
      <PageHeader />
      <Grid item xs={12}>
        <Stack direction="column" spacing={4} marginTop={2}>
          <ValidatorTitle address={address} />
          <ValidatorStakingBar
            validator={validator}
            accountResource={accountResource}
          />
          <ValidatorDetailCard
            validator={validator}
            accountResource={accountResource}
          />
          {connected && (
            <MyDepositsSection
              accountResource={accountResource}
              validator={validator}
            />
          )}
        </Stack>
      </Grid>
    </Grid>
  );
}
