import * as React from "react";
import {useTheme} from "@mui/material";
import * as RRD from "react-router-dom";
import Link from "@mui/material/Link";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {useNavigate} from "react-router-dom";
import Popover from "@mui/material/Popover";
import {IconButton} from "@mui/material";
import {grey} from "../themes/colors/aptosColorPalette";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";

import Button from "@mui/material/Button";

import {Types} from "aptos";
import {
  renderGas,
  renderSuccess,
  renderTimestamp,
  renderTransactionType,
} from "../pages/Transactions/helpers";
import {assertNever} from "../utils";
import {truncateAddress} from "../pages/utils";

type TransactionCellProps = {
  transaction: Types.Transaction;
};

function TransactionStatusCell({transaction}: TransactionCellProps) {
  return (
    <TableCell sx={{textAlign: "left"}}>
      {renderSuccess((transaction as any).success)}
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
        to={`/txn/${transaction.hash}`}
        color="primary"
        underline="none"
      >
        {(transaction as any).version}
      </Link>
    </TableCell>
  );
}

function TransactionGasCell({transaction}: TransactionCellProps) {
  return (
    <TableCell sx={{textAlign: "right"}}>
      {renderGas((transaction as any).gas_used)}
    </TableCell>
  );
}

function TransactionHashCell({transaction}: TransactionCellProps) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null,
  );

  const hashExpand = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const hashCollapse = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  const theme = useTheme();

  return (
    <TableCell>
      <Box>
        <Button
          sx={{
            textTransform: "none",
            backgroundColor: `${
              theme.palette.mode === "dark" ? grey[700] : grey[100]
            }`,
            display: "flex",
            borderRadius: 1,
            color: "inherit",
            padding: "0.15rem 0.5rem 0.15rem 1rem",
            "&:hover": {
              backgroundColor: `${
                theme.palette.mode === "dark" ? grey[700] : grey[100]
              }`,
            },
          }}
          aria-describedby={id}
          onClick={hashExpand}
          variant="contained"
          endIcon={<ChevronRightRoundedIcon sx={{opacity: "0.75", m: 0}} />}
        >
          {truncateAddress(transaction.hash)}
        </Button>

        <Popover
          onClick={(e) => {
            e.stopPropagation();
          }}
          sx={{
            overflow: "scroll",
            ".MuiPaper-root": {boxShadow: "none"},
            "&.MuiModal-root .MuiBackdrop-root": {
              transition: "none!important",
              backgroundColor: `${
                theme.palette.mode === "dark"
                  ? "rgba(18,22,21,0.5)"
                  : "rgba(255,255,255,0.5)"
              }`,
            },
          }}
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={hashCollapse}
          anchorOrigin={{
            vertical: "center",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "center",
            horizontal: "left",
          }}
        >
          <Typography
            sx={{
              display: "flex",
              alignItems: "center",
              backgroundColor: `${
                theme.palette.mode === "dark" ? grey[700] : grey[100]
              }`,
              px: 2,
              py: "0.15rem",
              fontSize: "14px",
              overflow: "scroll",
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >
            {transaction.hash}
            <IconButton
              aria-label="collapse hash"
              onClick={hashCollapse}
              sx={{
                ml: 1,
                mr: 0,
                p: 0,
                "&.MuiButtonBase-root:hover": {
                  bgcolor: "transparent",
                },
              }}
            >
              <ChevronLeftRoundedIcon sx={{opacity: "0.5"}} />
            </IconButton>
          </Typography>
        </Popover>
      </Box>
    </TableCell>
  );
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
  transaction: Types.Transaction;
  columns: TransactionColumn[];
};

function TransactionRow({transaction, columns}: TransactionRowProps) {
  const navigate = useNavigate();

  const rowClick = (event: React.MouseEvent<unknown>) => {
    navigate(`/txn/${(transaction as any).version}`);
  };

  const theme = useTheme();

  return (
    <TableRow
      onClick={(event) => rowClick(event)}
      sx={{
        cursor: "pointer",
        userSelect: "none",
        backgroundColor: `${
          theme.palette.mode === "dark" ? grey[800] : grey[50]
        }`,
        "&:hover:not(:active)": {
          filter: `${
            theme.palette.mode === "dark"
              ? "brightness(0.9)"
              : "brightness(0.99)"
          }`,
        },
        "&:active": {
          background: theme.palette.neutralShade.main,
          transform: "translate(0,0.1rem)",
        },
      }}
    >
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
          sx={{
            textAlign: "left",
            background: `${tableCellBackgroundColor}`,
            color: `${tableCellTextColor}`,
          }}
        >
          <Typography variant="subtitle1">Version</Typography>
        </TableCell>
      );
    case "type":
      return (
        <TableCell
          sx={{
            textAlign: "left",
            background: `${tableCellBackgroundColor}`,
            color: `${tableCellTextColor}`,
          }}
        >
          <Typography variant="subtitle1">Type</Typography>
        </TableCell>
      );
    case "hash":
      return (
        <TableCell
          sx={{
            textAlign: "left",
            background: `${tableCellBackgroundColor}`,
            color: `${tableCellTextColor}`,
          }}
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
            borderRadius: `${theme.shape.borderRadius}px 0 0 ${theme.shape.borderRadius}px`,
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
            background: `${tableCellBackgroundColor}`,
            color: `${tableCellTextColor}`,
            borderRadius: `0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0`,
          }}
        >
          <Typography variant="subtitle1">Gas</Typography>
        </TableCell>
      );
    case "timestamp":
      return (
        <TableCell
          sx={{
            textAlign: "right",
            background: `${tableCellBackgroundColor}`,
            color: `${tableCellTextColor}`,
          }}
        >
          <Typography variant="subtitle1">Timestamp</Typography>
        </TableCell>
      );
    default:
      return assertNever(column);
  }
}

type Props = {
  transactions: Types.Transaction[];
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
