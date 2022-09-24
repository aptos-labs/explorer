import React from "react";
import {Typography} from "@mui/material";
import {useGetAccountResources} from "../../../api/hooks/useGetAccountResources";
import {getFormattedBalanceStr} from "../../../components/IndividualPageContent/ContentValue/CurrencyValue";

interface CoinStore {
  coin: {
    value: string;
  };
}

type BalanceProps = {
  address: string;
};

export default function Balance({address}: BalanceProps) {
  const {isLoading, data, error} = useGetAccountResources(address);

  if (isLoading || error || !data) {
    return null;
  }

  const coinStore = data.find(
    (resource) =>
      resource.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
  );

  if (!coinStore) {
    return null;
  }

  const coinStoreData: CoinStore = coinStore.data as CoinStore;
  const balance = coinStoreData?.coin?.value;

  return (
    <Typography variant="body1">
      {`Balance: ${getFormattedBalanceStr(balance)} APT`}
    </Typography>
  );
}
