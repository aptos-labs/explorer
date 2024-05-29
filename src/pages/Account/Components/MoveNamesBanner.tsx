import "@aptos-labs/aptos-names-connector/dist/index.css";
import React from "react";
import {useGetInDevMode} from "../../../api/hooks/useGetInDevMode";
import {Banner} from "../../../components/Banner";
// import useSubmitTransaction from "../../../api/hooks/useSubmitTransaction";
// import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {Stack, useMediaQuery, useTheme} from "@mui/material";

export function MoveNamesBanner() {
  const inDev = useGetInDevMode();
  // const {connected} = useWallet();
  // const {submitTransaction} = useSubmitTransaction();
  const theme = useTheme();
  const isOnMobile = !useMediaQuery(theme.breakpoints.up("md"));

  // const MNSConnector = (
  //   <AptosNamesConnector
  //     buttonLabel="Claim your name"
  //     onSignTransaction={submitTransaction}
  //     isWalletConnected={connected}
  //     network="testnet"
  //   />
  // );

  // const action = isOnMobile ? null : MNSConnector;
  const action = null
  const text = "Claim your MNS name today!";
  const children = isOnMobile ? (
    <Stack direction="column">
      {text}
      {/* {MNSConnector} */}
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
