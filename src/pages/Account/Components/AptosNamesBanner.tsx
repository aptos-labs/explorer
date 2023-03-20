import {AptosNamesConnector} from "@aptos-labs/aptos-names-connector";
import "@aptos-labs/aptos-names-connector/dist/index.css";
import React from "react";
import {useGetInDevMode} from "../../../api/hooks/useGetInDevMode";
import {Banner} from "../../../components/Banner";
import useSubmitTransaction from "../../../api/hooks/useSubmitTransaction";
import {useWallet} from "@aptos-labs/wallet-adapter-react";

export function AptosNamesBanner() {
  const inDev = useGetInDevMode();
  const {connected} = useWallet();
  const {submitTransaction} = useSubmitTransaction();
  const action = (
    <AptosNamesConnector
      buttonLabel="Claim your name"
      onSignTransaction={submitTransaction}
      isWalletConnected={connected}
      network="testnet"
    />
  );

  return inDev ? (
      <Banner action={action} sx={{marginBottom: 2}}>
          Claim your ANS name today!
      </Banner>
  ) : null;
}
