import * as React from "react";
import {useTheme} from "@mui/material";
import * as RRD from "react-router-dom";
import Link from "@mui/material/Link";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { useNavigate } from 'react-router-dom';

import {Types} from "aptos";
import {
  renderGas,
  renderSuccess,
  renderTimestamp,
  renderTransactionType,
} from "../pages/Transactions/helpers";
import {assertNever} from "../utils";

type TransactionCellProps = {
  transaction: Types.OnChainTransaction;
};

function TransactionStatusCell({transaction}: TransactionCellProps) {
  return (
    <TableCell sx={{textAlign: "left"}}>
      {renderSuccess(transaction.success)}
    </TableCell>
  );
}

function TransactionTimestampCell({transaction}: TransactionCellProps) {
  const timestamp =
    "timestamp" in transaction ? (
      renderTimestamp(transaction.timestamp)
    ) : (
      // Genesis transaction
      <Typography variant="subtitle2" align="center">
        -
      </Typography>
    );

  return <TableCell sx={{textAlign: "right"}}>{timestamp}</TableCell>;
}

function TransactionTypeCell({transaction}: TransactionCellProps) {
  return <TableCell>{renderTransactionType(transaction.type)}</TableCell>;
}

function TransactionVersionCell({transaction}: TransactionCellProps) {
  return (
    <TableCell sx={{textAlign: "left"}}>
      <Link
        component={RRD.Link}
        to={`/txn/${transaction.version}`}
        color="primary"
      >
        {transaction.version}
      </Link>
    </TableCell>
  );
}

function TransactionGasCell({transaction}: TransactionCellProps) {
  return (
    <TableCell sx={{textAlign: "right"}}>
      {renderGas(transaction.gas_used)}
    </TableCell>
  );
}

function truncateMiddle(str:any, frontLen:number, backLen:number, truncateStr:any) {
  if (str === null) {
    return ''
  }
  var strLen = str.length
  // Setting default values
  frontLen = ~~frontLen // will cast to integer
  backLen = ~~backLen
  truncateStr = truncateStr || '…'
  if (frontLen === 0 && backLen === 0 || frontLen >= strLen || backLen >= strLen || (frontLen + backLen) >= strLen) {
    return str
  } else if (backLen === 0) {
    return str.slice(0, frontLen) + truncateStr
  } else {
    return str.slice(0, frontLen) + truncateStr + str.slice(strLen - backLen)
  }
}

function TransactionHashCell({transaction}: TransactionCellProps) {
  return <TableCell>{truncateMiddle(transaction.hash, 4, 4, '…') }</TableCell>;
}

const TransactionCells = Object.freeze({
  version: TransactionVersionCell,  
  type: TransactionTypeCell,
  hash: TransactionHashCell,
  status: TransactionStatusCell,
  gas: TransactionGasCell,
  timestamp: TransactionTimestampCell,
});

type TransactionColumn = keyof typeof TransactionCells;

const DEFAULT_COLUMNS: TransactionColumn[] = [
  "version",
  "type",
  "hash",
  "status",
  "gas",
  "timestamp",
];

type TransactionRowProps = {
  transaction: Types.OnChainTransaction;
  columns: TransactionColumn[];
};

function TransactionRow({transaction, columns}: TransactionRowProps) {
  
  const navigate = useNavigate();

  const handleClick = (event: React.MouseEvent<unknown>) => {
    navigate(`/txn/${transaction.version}`);
  };

  const theme = useTheme();
  
  return (
    <TableRow onClick={(event) => handleClick(event)} sx={{ cursor: "pointer", userSelect: "none", background: theme.palette.neutralShade.main, "&:hover:not(:active)": { boxShadow: "0px 4px 8px -3px rgb(0 0 0 / 5%)", filter: "brightness(1.2)" }, "&:active": {background: theme.palette.neutralShade.main, transform:"translate(0,0.1rem)"} }}>
      {columns.map((column) => {
        const Cell = TransactionCells[column];
        return <Cell key={column} transaction={transaction} />;
      })}
    </TableRow>
  );
}

type TransactionHeaderCellProps = {
  column: TransactionColumn;
};

function TransactionHeaderCell({column}: TransactionHeaderCellProps) {

  const theme = useTheme();
  const tableCellBackgroundColor = "transparent";
  const tableCellTextColor = theme.palette.text.secondary;

  switch (column) {
    case "version":
      return (
        <TableCell
          sx={{ textAlign: "left", background: `${tableCellBackgroundColor}`, color: `${tableCellTextColor}` }}
        >
          <Typography variant="subtitle1">Version</Typography>
        </TableCell>
      );    
    case "type":
      return (
        <TableCell
          sx={{ textAlign: "left", background: `${tableCellBackgroundColor}`, color: `${tableCellTextColor}` }}
        >
          <Typography variant="subtitle1">Type</Typography>
        </TableCell>
      );
    case "hash":
      return (
        <TableCell
          sx={{ textAlign: "left", background: `${tableCellBackgroundColor}`, color: `${tableCellTextColor}` }}
        >
          <Typography variant="subtitle1">Hash</Typography>
        </TableCell>
      );          
    case "status":
      return (
        <TableCell
          sx={{
            textAlign: "left",
            background: `${tableCellBackgroundColor}`,
            color: `${tableCellTextColor}`,
            borderRadius: "8px 0 0 8px",
          }}
        >
          <Typography variant="subtitle1">Status</Typography>
        </TableCell>
      );  
    case "gas":
      return (
        <TableCell
          sx={{
            textAlign: "right",
            background: `${tableCellBackgroundColor}`, color: `${tableCellTextColor}`,
            borderRadius: "0 8px 8px 0",
          }}
        >
          <Typography variant="subtitle1">Gas Used</Typography>
        </TableCell>
      );
    case "timestamp":
      return (
        <TableCell
          sx={{ textAlign: "right", background: `${tableCellBackgroundColor}`, color: `${tableCellTextColor}` }}
        >
          <Typography variant="subtitle1">Timestamp</Typography>
        </TableCell>
      );      
    default:
      return assertNever(column);
  }
}

type Props = {
  transactions: Types.OnChainTransaction[];
  columns?: TransactionColumn[];
};

export function TransactionsTable({
  transactions,
  columns = DEFAULT_COLUMNS,
}: Props) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          {columns.map((column) => (
            <TransactionHeaderCell key={column} column={column} />
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {transactions.map((transaction, i) => {
          return (
            <TransactionRow
              key={`${i}-${transaction.hash}`}
              transaction={transaction}
              columns={columns}
            />
          );
        })}
      </TableBody>
    </Table>
  );
}
