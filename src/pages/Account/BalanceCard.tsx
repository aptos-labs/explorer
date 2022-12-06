import React from "react";
import {Stack, Typography} from "@mui/material";
import {useGetAccountResources} from "../../api/hooks/useGetAccountResources";
import {getFormattedBalanceStr} from "../../components/IndividualPageContent/ContentValue/CurrencyValue";
import {Card} from "../../components/Card";
import {grey} from "../../themes/colors/aptosColorPalette";
import StyledTooltip from "../../components/StyledTooltip";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

interface CoinStore {
  coin: {
    value: string;
  };
}

type BalanceCardProps = {
  address: string;
};

export default function BalanceCard({address}: BalanceCardProps) {
  const {isLoading, data, error} = useGetAccountResources(address);

  if (isLoading || error || !data) {
    return null;
  }

  const coinStore = data.find(
    (resource) =>
      resource.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
  );

  if (!coinStore) {
    return null;
  }

  const coinStoreData: CoinStore = coinStore.data as CoinStore;
  const balance = coinStoreData?.coin?.value;

  return (
    <Card height="auto">
      <Stack spacing={1.5} marginY={1}>
        <Typography fontSize={17} fontWeight={700}>
          {`${getFormattedBalanceStr(balance)} APT`}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography fontSize={12} color={grey[450]}>
            Balance
          </Typography>
          <StyledTooltip title="This balance reflects the amount of APT tokens held in your wallet.">
            <InfoOutlinedIcon sx={{fontSize: 15, color: grey[450]}} />
          </StyledTooltip>
        </Stack>
      </Stack>
    </Card>
  );
}
