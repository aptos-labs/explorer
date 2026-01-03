import React from "react";
import {useGetInDevMode} from "../../../api/hooks/useGetInDevMode";
import {Banner} from "../../../components/Banner";
// import useSubmitTransaction from "../../../api/hooks/useSubmitTransaction";
// import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {Stack, useMediaQuery, useTheme} from "@mui/material";

export function AptosNamesBanner() {
  const inDev = useGetInDevMode();
  // const {connected} = useWallet();
  // const {submitTransaction} = useSubmitTransaction();
  const theme = useTheme();
  const isOnMobile = !useMediaQuery(theme.breakpoints.up("md"));

  // const ANSConnector = (
  //   <AptosNamesConnector
  //     buttonLabel="Claim your name"
  //     onSignTransaction={submitTransaction}
  //     isWalletConnected={connected}
  //     network="testnet"
  //   />
  // );

  // We upgraded Explorer to latest Adapter that uses @aptos-labs/ts-sdk
  // We need to upgrade ANSConnector code also to have this functionality working
  const ANSConnector = "to implement";

  const action = isOnMobile ? null : ANSConnector;
  const text = "Claim your ANS name today!";
  const children = isOnMobile ? (
    <Stack direction="column">
      {text}
      {ANSConnector}
    </Stack>
  ) : (
    <>{text}</>
  );

  return inDev ? (
    <Banner pillText="NEW" action={action} sx={{marginBottom: 2}}>
      {children}
    </Banner>
  ) : null;
}
