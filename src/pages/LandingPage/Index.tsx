import React from "react";
import LedgerInfo from "./LedgerInfo";
import Typography from "@mui/material/Typography";
import DividerHero from "../../components/DividerHero";
import HeadingSub from "../../components/HeadingSub";
import HeaderSearch from "../layout/Search/Index";
import Box from "@mui/material/Box";
import {useGetInDevMode} from "../../api/hooks/useGetInDevMode";
import NetworkInfo from "./NetworkInfo/Index";
import TransactionsPreview from "./TransactionsPreview";
import UserTransactionsPreview from "./UserTransactionsPreview";
import {useGetIsGraphqlClientSupported} from "../../api/hooks/useGraphqlClient";

export default function LandingPage() {
  const inDev = useGetInDevMode();
  const isGraphqlClientSupported = useGetIsGraphqlClientSupported();

  return inDev ? (
    <Box>
      <HeadingSub>Network</HeadingSub>
      <Typography variant="h3" component="h3" marginBottom={4}>
        Aptos Explorer
      </Typography>
      <NetworkInfo />
      <HeaderSearch />
      {isGraphqlClientSupported ? (
        <UserTransactionsPreview />
      ) : (
        <TransactionsPreview />
      )}
    </Box>
  ) : (
    <Box>
      <HeadingSub>Network</HeadingSub>
      <Typography variant="h1" component="h1" gutterBottom>
        Aptos Explorer
      </Typography>
      <DividerHero />
      <LedgerInfo />
      <HeaderSearch />
      <TransactionsPreview />
    </Box>
  );
}
