import {useParams} from "react-router-dom";
import {Grid} from "@mui/material";
import React from "react";
import AccountTabs, {TabValue} from "./Tabs";
import AccountTitle from "./Title";
import AccountInfo from "./AccountInfo/Index";
import {useGetInDevMode} from "../../api/hooks/useGetInDevMode";
import BalanceCard from "./BalanceCard";
import PageHeader from "../../components/PageHeader";

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
      <Grid item xs={12} md={12} lg={12}>
        <PageHeader />
      </Grid>
      {inDev ? (
        <>
          <Grid item xs={12} md={8} lg={9} alignSelf="center">
            <AccountTitle address={address} />
          </Grid>
          <Grid item xs={12} md={4} lg={3} marginTop={{md: 0, xs: 1}}>
            <BalanceCard address={address} />
          </Grid>
        </>
      ) : (
        <>
          <Grid item xs={12} md={12} lg={12}>
            <AccountTitle address={address} />
          </Grid>
          <Grid item xs={12} md={12} lg={12} marginTop={2}>
            <AccountInfo address={address} />
          </Grid>
        </>
      )}
      <Grid item xs={12} md={12} lg={12} marginTop={4}>
        <AccountTabs
          address={address}
          tabValues={inDev ? TAB_VALUES_IN_DEV : undefined}
        />
      </Grid>
    </Grid>
  );
}
