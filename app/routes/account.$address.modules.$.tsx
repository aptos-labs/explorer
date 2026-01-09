import {createFileRoute, useParams} from "@tanstack/react-router";
import {Grid, Box} from "@mui/material";
import {Network} from "aptos";
import ModulesTabs from "../pages/Account/Tabs/ModulesTab/Tabs";
import PageHeader from "../pages/layout/PageHeader";
import AccountTitle from "../pages/Account/Title";
import BalanceCard from "../pages/Account/BalanceCard";
import AccountTabs from "../pages/Account/Tabs";
import {useAccountTabValues} from "../pages/Account/hooks/useAccountTabValues";
import {AptosNamesBanner} from "../pages/Account/Components/AptosNamesBanner";
import {useNetworkName} from "../global-config";

// Splat route for /account/:address/modules/*
// Captures: /modules/code, /modules/code/MyModule, /modules/view/MyModule/myFunc, etc.
export const Route = createFileRoute("/account/$address/modules/$")({
  component: ModulesPage,
});

function ModulesPage() {
  const {address} = useParams({strict: false}) as {address: string};
  const {tabValues} = useAccountTabValues(address, false);
  const networkName = useNetworkName();

  return (
    <Grid container spacing={1}>
      <Grid size={{xs: 12, md: 12, lg: 12}}>
        <PageHeader />
      </Grid>
      <Grid size={{xs: 12, md: 8, lg: 9}} alignSelf="center">
        <AccountTitle address={address} isObject={false} />
      </Grid>
      <Grid size={{xs: 12, md: 4, lg: 3}} marginTop={{md: 0, xs: 2}}>
        <BalanceCard address={address} />
      </Grid>
      <Grid size={{xs: 12, md: 8, lg: 12}} marginTop={4} alignSelf="center">
        {networkName === Network.MAINNET && <AptosNamesBanner />}
      </Grid>
      <Grid size={{xs: 12, md: 12, lg: 12}} marginTop={4}>
        <Box sx={{width: "100%"}}>
          <AccountTabs
            address={address}
            isObject={false}
            navOnly
            currentTab="modules"
            tabValues={tabValues}
          />
          <ModulesTabs address={address} isObject={false} />
        </Box>
      </Grid>
    </Grid>
  );
}
