import {AptosNamesConnector} from "@aptos-labs/aptos-names-connector";
import "@aptos-labs/aptos-names-connector/dist/index.css";
import React from "react";
import {useGetInDevMode} from "../../../api/hooks/useGetInDevMode";
import {Banner} from "../../../components/Banner";
import useSubmitTransaction from "../../../api/hooks/useSubmitTransaction";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {Stack, useMediaQuery, useTheme} from "@mui/material";
import {Types} from "aptos";
import {
  EntryFunctionArgumentTypes,
  InputGenerateTransactionPayloadData,
  SimpleEntryFunctionArgumentTypes,
} from "@aptos-labs/ts-sdk";

export function AptosNamesBanner() {
  const inDev = useGetInDevMode();
  const {connected} = useWallet();
  const {submitTransaction} = useSubmitTransaction();
  const theme = useTheme();
  const isOnMobile = !useMediaQuery(theme.breakpoints.up("md"));

  const ANSConnector = (
    <AptosNamesConnector
      buttonLabel="Claim your name"
      onSignTransaction={(payload: Types.TransactionPayload) => {
        // TODO: Aptos names connector needs to be updated to SDK v2
        // Only functions that should come are entry function payloads
        if (payload.type === "entry_function_payload") {
          const typedPayload = payload as Types.EntryFunctionPayload;

          const data: InputGenerateTransactionPayloadData = {
            // TODO: This typing is too strict
            function:
              typedPayload.function as `${string}::${string}::${string}`,
            functionArguments: typedPayload.arguments as (
              | SimpleEntryFunctionArgumentTypes
              | EntryFunctionArgumentTypes
            )[],
            typeArguments: typedPayload.type_arguments,
          };
          return submitTransaction({data});
        } else {
          throw new Error("Unsupported payload type");
        }
      }}
      isWalletConnected={connected}
      network="testnet"
    />
  );

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
    <Banner action={action} sx={{marginBottom: 2}}>
      {children}
    </Banner>
  ) : null;
}
