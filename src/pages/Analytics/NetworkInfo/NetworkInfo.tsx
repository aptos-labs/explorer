import React, {createContext} from "react";
import Grid from "@mui/material/Grid";
import TotalSupply from "./TotalSupply";
import TotalStake from "./TotalStake";
import TPS from "./TPS";
import TotalTransactions from "./TotalTransactions";
import {useGetInMainnet} from "../../../api/hooks/useGetInMainnet";
import {Link} from "../../../routing";
import ActiveNodes from "./ActiveNodes";

type CardStyle = "default" | "outline";

export const StyleContext = createContext<CardStyle>("default");

function LinkableContainer({
  linkToAnalyticsPage,
  children,
}: {
  linkToAnalyticsPage: boolean;
  children: React.ReactNode;
}) {
  const inMainnet = useGetInMainnet();

  return inMainnet && linkToAnalyticsPage ? (
    <Link to="/analytics" underline="none" color="inherit" variant="inherit">
      {children}
    </Link>
  ) : (
    <>{children}</>
  );
}

type NetworkInfoProps = {
  isOnHomePage?: boolean;
};

export default function NetworkInfo({isOnHomePage}: NetworkInfoProps) {
  const onHomePage = isOnHomePage === true;
  return (
    <StyleContext.Provider value={onHomePage ? "default" : "outline"}>
      <Grid
        container
        spacing={3}
        direction="row"
        sx={{alignContent: "flex-start"}}
        marginBottom={onHomePage ? 6 : 0}
      >
        {onHomePage && (
          <Grid item xs={12} md={12} lg={12}>
            <TotalTransactions />
          </Grid>
        )}
        <Grid item xs={12} md={6} lg={3}>
          <LinkableContainer linkToAnalyticsPage={onHomePage}>
            <TotalSupply />
          </LinkableContainer>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <LinkableContainer linkToAnalyticsPage={onHomePage}>
            <TotalStake />
          </LinkableContainer>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <LinkableContainer linkToAnalyticsPage={onHomePage}>
            <TPS />
          </LinkableContainer>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <LinkableContainer linkToAnalyticsPage={onHomePage}>
            <ActiveNodes />
          </LinkableContainer>
        </Grid>
      </Grid>
    </StyleContext.Provider>
  );
}
