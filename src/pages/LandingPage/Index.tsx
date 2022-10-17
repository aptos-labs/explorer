import React from "react";
import Typography from "@mui/material/Typography";
import HeaderSearch from "../Layout/Search/Index";
import Box from "@mui/material/Box";
import NetworkInfo from "./NetworkInfo/Index";
import TransactionsPreview from "./TransactionsPreview";

export default function LandingPage() {
  return (
    <Box>
      <Typography variant="h3" component="h3" marginBottom={4}>
        Aptos Explorer
      </Typography>
      <NetworkInfo />
      <HeaderSearch />
      <TransactionsPreview />
    </Box>
  );
}
