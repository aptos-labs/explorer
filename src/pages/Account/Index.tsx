import {useParams} from "react-router-dom";
import {Stack, Grid} from "@mui/material";
import React from "react";
import IndividualPageHeader from "../../components/IndividualPageHeader";
import AccountTabs from "./Tabs";
import AccountTitle from "./Title/Index";
import AccountInfo from "./AccountInfo/Index";

export default function AccountPage() {
  const {address} = useParams();

  if (typeof address !== "string") {
    return null;
  }

  return (
    <Grid container spacing={1}>
      <IndividualPageHeader />
      <Grid item xs={12}>
        <Stack direction="column" spacing={4} marginTop={2}>
          <AccountTitle address={address} />
          <AccountInfo address={address} />
          <AccountTabs address={address} />
        </Stack>
      </Grid>
    </Grid>
  );
}
