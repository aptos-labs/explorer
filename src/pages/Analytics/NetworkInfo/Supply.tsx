import {Box, Stack} from "@mui/material";
import React, {useEffect, useState} from "react";
import {useGlobalState} from "../../../GlobalState";
import MetricCard, {DoubleMetricCard} from "./MetricCard";
import {getFormattedBalanceStr} from "../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import {useGetSupply} from "../../../api/hooks/useGetSupply";
import {useGetCoinSupplyLimit} from "../../../api/hooks/useGetCoinSupplyLimit";
import {useGetInDevMode} from "../../../api/hooks/useGetInDevMode";

const TOTAL_SUPPLY_TOOLTIP =
  "Amount of APT tokens flowing through the Aptos network.";
// TODO: Update circulating supply tooltip.
const CIRCULATING_SUPPLY_TOOLTIP =
  "Amount of APT tokens flowing through the Aptos network.";

function getFormattedSupplyStr(supply: number | undefined): string {
  if (supply === undefined) {
    return "-";
  }
  const supplyInOctaStr = (supply * Math.pow(10, 8)).toString();
  return getFormattedBalanceStr(supplyInOctaStr, undefined, 0);
}

export function TotalSupply() {
  const totalSupply = useGetCoinSupplyLimit();

  return (
    <MetricCard
      data={
        totalSupply
          ? getFormattedBalanceStr(totalSupply.toString(), undefined, 0)
          : "-"
      }
      label="Total Supply"
      tooltip={TOTAL_SUPPLY_TOOLTIP}
    />
  );
}

export function TotalAndCirculatingSupply() {
  const supply = useGetSupply();

  const circulatingSupplyStr = getFormattedSupplyStr(
    supply?.current_circulating_supply,
  );

  const totalSupplyStr = getFormattedSupplyStr(supply?.current_total_supply);

  return (
    <DoubleMetricCard
      data1={circulatingSupplyStr}
      data2={totalSupplyStr}
      label1="CIRCULATING SUPPLY"
      label2="TOTAL SUPPLY"
      cardLabel="Supply"
      tooltip={
        <Stack spacing={1}>
          <Box>
            <Box sx={{fontWeight: 700}}>Circulating Supply</Box>
            <Box>{CIRCULATING_SUPPLY_TOOLTIP}</Box>
          </Box>
          <Box>
            <Box sx={{fontWeight: 700}}>Total Supply</Box>
            <Box>{TOTAL_SUPPLY_TOOLTIP}</Box>
          </Box>
        </Stack>
      }
    />
  );
}

export default function Supply() {
  const inDev = useGetInDevMode();
  const [state, _] = useGlobalState();
  const [showCirculatingSupply, setShowCirculatingSupply] =
    useState<boolean>(true);

  useEffect(() => {
    if (state.network_name === "mainnet") {
      setShowCirculatingSupply(true);
    } else {
      setShowCirculatingSupply(false);
    }
  }, [state]);

  return inDev && showCirculatingSupply ? (
    <TotalAndCirculatingSupply />
  ) : (
    <TotalSupply />
  );
}
