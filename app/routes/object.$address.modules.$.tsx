import {createFileRoute, useParams} from "@tanstack/react-router";
import {Grid} from "@mui/material";
import ModulesTabs from "../pages/Account/Tabs/ModulesTab/Tabs";
import PageHeader from "../pages/layout/PageHeader";
import AccountTitle from "../pages/Account/Title";
import BalanceCard from "../pages/Account/BalanceCard";

// Splat route for /object/:address/modules/*
// Captures: /modules/code, /modules/code/MyModule, /modules/view/MyModule/myFunc, etc.
export const Route = createFileRoute("/object/$address/modules/$")({
  component: ModulesPage,
});

function ModulesPage() {
  const {address} = useParams({strict: false}) as {address: string};
  return (
    <Grid container spacing={1}>
      <Grid size={{xs: 12, md: 12, lg: 12}}>
        <PageHeader />
      </Grid>
      <Grid size={{xs: 12, md: 8, lg: 9}} alignSelf="center">
        <AccountTitle address={address} isObject={true} />
      </Grid>
      <Grid size={{xs: 12, md: 4, lg: 3}} marginTop={{md: 0, xs: 2}}>
        <BalanceCard address={address} />
      </Grid>
      <Grid size={{xs: 12, md: 12, lg: 12}} marginTop={4}>
        <ModulesTabs address={address} isObject={true} />
      </Grid>
    </Grid>
  );
}
