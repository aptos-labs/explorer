import {useParams} from "react-router-dom";
import {Stack} from "@mui/material";
import React from "react";
import {useGlobalState} from "../../GlobalState";
import Grid from "@mui/material/Grid";
import DividerHero from "../../components/DividerHero";
import Typography from "@mui/material/Typography";
import HeaderSearch from "../layout/Search";
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
      {/* TODO: create reusable component for the header */}
      <Grid item xs={12}>
        <Typography
          color="primary"
          variant="subtitle2"
          component="span"
          sx={{mb: 2}}
        >
          Network
        </Typography>
        <Typography variant="h3" component="h1" gutterBottom>
          Aptos Explorer
        </Typography>
        <DividerHero />
        <HeaderSearch />
      </Grid>
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
