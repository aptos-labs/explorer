import {Grid, Typography} from "@mui/material";
import * as React from "react";
import {useGetInGtmMode} from "../api/hooks/useGetInDevMode";
import HeaderSearch from "../pages/layout/Search/Index";
import DividerHero from "./DividerHero";
import GoBack from "./GoBack";

export default function PageHeader() {
  const inGtm = useGetInGtmMode();
  return (
    <>
      {inGtm ? <GoBack /> : null}
      {inGtm ? (
        <HeaderSearch />
      ) : (
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
      )}
    </>
  );
}
