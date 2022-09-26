import {useParams} from "react-router-dom";
import {Stack, Grid} from "@mui/material";
import React from "react";
import IndividualPageHeader from "../../components/IndividualPageHeader";
import AccountTabs, {TabValue} from "./Tabs";
import AccountTitle from "./Title";
import AccountInfo from "./AccountInfo/Index";
import {useGetInDevMode} from "../../api/hooks/useGetInDevMode";
import HeaderSearch from "../layout/Search/Index";

const TAB_VALUES_IN_DEV: TabValue[] = [
  "transactions",
  "tokens",
  "resources",
  "modules",
  "info",
];

export default function AccountPage() {
  const inDev = useGetInDevMode();
  const {address} = useParams();

  if (typeof address !== "string") {
    return null;
  }

  return (
    <Grid container spacing={1}>
      {inDev ? <HeaderSearch /> : <IndividualPageHeader />}
      <Grid item xs={12}>
        <Stack direction="column" spacing={4} marginTop={2}>
          <AccountTitle address={address} />
          <AccountInfo address={address} />
          <AccountTabs
            address={address}
            tabValues={inDev ? TAB_VALUES_IN_DEV : undefined}
          />
        </Stack>
      </Grid>
    </Grid>
  );
}
