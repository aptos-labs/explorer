import React, {createContext} from "react";
import Grid from "@mui/material/Grid";
import TotalSupply from "./TotalSupply";
import TotalStake from "./TotalStake";
import TPS from "./TPS";
import ActiveValidators from "./ActiveValidators";
import TotalTransactions from "./TotalTransactions";

type CardStyle = "default" | "outline";

export const StyleContext = createContext<CardStyle>("default");

type NetworkInfoProps = {
  isOnAnalyticsPage?: boolean;
};

export default function NetworkInfo({isOnAnalyticsPage}: NetworkInfoProps) {
  return (
    <StyleContext.Provider value={isOnAnalyticsPage ? "outline" : "default"}>
      <Grid
        container
        spacing={3}
        direction="row"
        sx={{alignContent: "flex-start"}}
        marginBottom={isOnAnalyticsPage ? 0 : 6}
      >
        {!isOnAnalyticsPage && (
          <Grid item xs={12} md={12} lg={12}>
            <TotalTransactions />
          </Grid>
        )}
        <Grid item xs={12} md={6} lg={3}>
          <TotalSupply />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <TotalStake />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <TPS />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <ActiveValidators />
        </Grid>
      </Grid>
    </StyleContext.Provider>
  );
}
