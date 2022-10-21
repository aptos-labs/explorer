import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import GeneralTableRow from "../../../components/Table/GeneralTableRow";
import GeneralTableHeaderCell from "../../../components/Table/GeneralTableHeaderCell";
import {assertNever} from "../../../utils";
import HashButton, {HashType} from "../../../components/HashButton";
import {grey} from "../../../themes/colors/aptosColorPalette";

type CoinCellProps = {
  coin: any; // TODO: add graphql data typing
};

function CoinNameCell({coin}: CoinCellProps) {
  return (
    <TableCell
      sx={{
        textAlign: "left",
        maxWidth: 300,
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {coin?.coin_info?.name}
    </TableCell>
  );
}

function AmountCell({coin}: CoinCellProps) {
  const amount = coin?.amount;
  const decimals = coin?.coin_info?.decimals;

  if (!amount || !decimals) {
    return <TableCell>-</TableCell>;
  }

  const formattedAmount = parseFloat(amount) / Math.pow(10, decimals);
  return (
    <TableCell>
      <span>{formattedAmount}</span>
      <span style={{marginLeft: 8, color: grey[450]}}>
        {coin?.coin_info?.symbol}
      </span>
    </TableCell>
  );
}

function CoinTypeCell({coin}: CoinCellProps) {
  return (
    <TableCell sx={{width: 450}}>
      <HashButton hash={coin?.coin_type} type={HashType.OTHERS} size="large" />
    </TableCell>
  );
}

const CoinCells = Object.freeze({
  name: CoinNameCell,
  amount: AmountCell,
  coinType: CoinTypeCell,
});

type Column = keyof typeof CoinCells;

const DEFAULT_COLUMNS: Column[] = ["name", "amount", "coinType"];

type CoinRowProps = {
  coin: any; // TODO: add graphql data typing
  columns: Column[];
};

function CoinRow({coin, columns}: CoinRowProps) {
  return (
    <GeneralTableRow>
      {columns.map((column) => {
        const Cell = CoinCells[column];
        return <Cell key={column} coin={coin} />;
      })}
    </GeneralTableRow>
  );
}

type CoinHeaderCellProps = {
  column: Column;
};

function CoinHeaderCell({column}: CoinHeaderCellProps) {
  switch (column) {
    case "name":
      return <GeneralTableHeaderCell header="Name" />;
    case "amount":
      return <GeneralTableHeaderCell header="Amount" />;
    case "coinType":
      return <GeneralTableHeaderCell header="Coin Type" />;
    default:
      return assertNever(column);
  }
}

type CoinsTableProps = {
  coins: any; // TODO: add graphql data typing
  columns?: Column[];
};

export function CoinsTable({
  coins,
  columns = DEFAULT_COLUMNS,
}: CoinsTableProps) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          {columns.map((column) => (
            <CoinHeaderCell key={column} column={column} />
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {coins.map((coin: any, i: number) => {
          return <CoinRow key={i} coin={coin} columns={columns} />;
        })}
      </TableBody>
    </Table>
  );
}
