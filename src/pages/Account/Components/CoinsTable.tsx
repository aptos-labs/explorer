import * as React from "react";
import {Table, TableHead, TableRow} from "@mui/material";
import GeneralTableRow from "../../../components/Table/GeneralTableRow";
import GeneralTableHeaderCell from "../../../components/Table/GeneralTableHeaderCell";
import HashButton, {HashType} from "../../../components/HashButton";
import {grey} from "../../../themes/colors/aptosColorPalette";
import GeneralTableBody from "../../../components/Table/GeneralTableBody";
import GeneralTableCell from "../../../components/Table/GeneralTableCell";

function CoinNameCell({name}: {name: string}) {
  return (
    <GeneralTableCell
      sx={{
        textAlign: "left",
        maxWidth: 300,
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {name}
    </GeneralTableCell>
  );
}

function AmountCell({
  amount,
  decimals,
  symbol,
}: {
  amount: number | null | undefined;
  decimals: number | null | undefined;
  symbol: string;
}) {
  if (amount == null || decimals == null) {
    return <GeneralTableCell>-</GeneralTableCell>;
  }

  const formattedAmount = amount / Math.pow(10, decimals);
  return (
    <GeneralTableCell>
      <span>{formattedAmount}</span>
      <span style={{marginLeft: 8, color: grey[450]}}>{symbol}</span>
    </GeneralTableCell>
  );
}

function CoinTypeCell({
  assetVersion,
  assetType,
}: {
  assetVersion: string;
  assetType: string;
}) {
  function getType() {
    switch (assetVersion) {
      case "v1":
        return HashType.COIN;
      case "v2":
        return HashType.FUNGIBLE_ASSET;
      default:
        return HashType.OTHERS;
    }
  }

  return (
    <GeneralTableCell sx={{width: 450}}>
      <HashButton hash={assetType} type={getType()} size="large" />
    </GeneralTableCell>
  );
}

export function CoinsTable({
  coins,
}: {
  coins: {
    name: string;
    amount: number;
    decimals: number;
    symbol: string;
    assetType: string;
    assetVersion: string;
  }[];
}) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <GeneralTableHeaderCell header="Name" />
          <GeneralTableHeaderCell header="Amount" />
          <GeneralTableHeaderCell header="Type" />
          <GeneralTableHeaderCell header="Coin Type" />
        </TableRow>
      </TableHead>
      <GeneralTableBody>
        {coins.map(
          ({name, amount, decimals, symbol, assetType, assetVersion}, i) => {
            let friendlyType = assetVersion;
            switch (assetVersion) {
              case "v1":
                friendlyType = "Coin";
                break;
              case "v2":
                friendlyType = "Fungible Asset";
                break;
            }
            return (
              <GeneralTableRow key={i}>
                <CoinNameCell name={name} />
                <AmountCell
                  amount={amount}
                  decimals={decimals}
                  symbol={symbol}
                />
                <CoinNameCell name={friendlyType} />
                <CoinTypeCell
                  assetVersion={assetVersion}
                  assetType={assetType}
                />
              </GeneralTableRow>
            );
          },
        )}
      </GeneralTableBody>
    </Table>
  );
}
