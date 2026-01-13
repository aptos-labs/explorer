import * as React from "react";
import {useMemo} from "react";
import {Box, Stack, useTheme, useMediaQuery, Paper} from "@mui/material";
import {getSemanticColors} from "../../themes/colors/aptosBrandColors";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import GeneralTableRow from "../../components/Table/GeneralTableRow";
import GeneralTableHeaderCell from "../../components/Table/GeneralTableHeaderCell";
import HashButton, {HashType} from "../../components/HashButton";
import {Types} from "aptos";
import {assertNever} from "../../utils";
import {
  TableTransactionType,
  TransactionTypeName,
} from "../../components/TransactionType";
import {TableTransactionStatus} from "../../components/TransactionStatus";
import {getTableFormattedTimestamp} from "../utils";
import GasFeeValue from "../../components/IndividualPageContent/ContentValue/GasFeeValue";
import {useGetTransaction} from "../../api/hooks/useGetTransaction";
import TransactionTypeTooltip from "./Components/TransactionTypeTooltip";
import {APTCurrencyValue} from "../../components/IndividualPageContent/ContentValue/CurrencyValue";
import GeneralTableCell from "../../components/Table/GeneralTableCell";
import GeneralTableBody from "../../components/Table/GeneralTableBody";
import VirtualizedTableBody from "../../components/Table/VirtualizedTableBody";
import TransactionFunction from "../Transaction/Tabs/Components/TransactionFunction";
import {
  getCoinBalanceChangeForAccount,
  getTransactionAmount,
  getTransactionCounterparty,
} from "../Transaction/utils";
import {
  Link,
  useNavigate,
  useAugmentToWithGlobalSearchParams,
} from "../../routing";
import {
  ArrowForwardOutlined,
  TextSnippetOutlined,
  ContentCopy,
  OpenInNew,
} from "@mui/icons-material";
import {truncateAddress} from "../utils";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Tooltip from "@mui/material/Tooltip";

type TransactionCellProps = {
  transaction: Types.Transaction;
  address?: string;
};

function SequenceNumberCell({transaction}: TransactionCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "left"}}>
      {"sequence_number" in transaction && transaction.sequence_number}
    </GeneralTableCell>
  );
}

function TransactionVersionStatusCell({transaction}: TransactionCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "left"}}>
      <Stack direction="row" spacing={0.5}>
        <Link
          to={`/txn/${"version" in transaction && transaction.version}`}
          color="primary"
          underline="none"
        >
          {"version" in transaction && transaction.version}
        </Link>
        {"success" in transaction && (
          <TableTransactionStatus success={transaction.success} />
        )}
      </Stack>
    </GeneralTableCell>
  );
}

function TransactionTypeCell({transaction}: TransactionCellProps) {
  return (
    <GeneralTableCell>
      {<TableTransactionType type={transaction.type} />}
    </GeneralTableCell>
  );
}

function TransactionTimestampCell({transaction}: TransactionCellProps) {
  const timestamp =
    "timestamp" in transaction ? (
      getTableFormattedTimestamp(transaction.timestamp)
    ) : (
      // Genesis transaction
      <Typography variant="subtitle2" align="center">
        -
      </Typography>
    );

  return <GeneralTableCell>{timestamp}</GeneralTableCell>;
}

function TransactionSenderCell({transaction}: TransactionCellProps) {
  let sender;
  if (transaction.type === TransactionTypeName.User) {
    sender = (transaction as Types.UserTransaction).sender;
  } else if (transaction.type === "block_metadata_transaction") {
    sender = (transaction as Types.BlockMetadataTransaction).proposer;
  }

  return (
    <GeneralTableCell>
      {sender && <HashButton hash={sender} type={HashType.ACCOUNT} />}
    </GeneralTableCell>
  );
}

function TransactionReceiverOrCounterPartyCell({
  transaction,
}: TransactionCellProps) {
  const counterparty = getTransactionCounterparty(transaction);
  // TODO: Look into adding a different column for smart contract, so it doesn't get confused with the receiver.
  return (
    <GeneralTableCell>
      {counterparty && (
        <Box
          sx={{display: "flex", fontSize: "inherit", alignItems: "row", gap: 1}}
        >
          {counterparty.role === "smartContract" ? (
            <Tooltip title={"Smart Contract"} placement="top">
              <TextSnippetOutlined sx={{position: "relative", top: 2}} />
            </Tooltip>
          ) : (
            <Tooltip title={"Receiver"} placement="top">
              <ArrowForwardOutlined sx={{position: "relative", top: 2}} />
            </Tooltip>
          )}
          <span>
            <HashButton hash={counterparty.address} type={HashType.ACCOUNT} />
          </span>
        </Box>
      )}
    </GeneralTableCell>
  );
}

function TransactionFunctionCell({transaction}: TransactionCellProps) {
  return (
    <GeneralTableCell
      sx={{
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
      }}
    >
      <TransactionFunction
        transaction={transaction}
        sx={{maxWidth: {xs: 200, md: 300, lg: 400}}}
      />
    </GeneralTableCell>
  );
}

function TransactionAmount({
  transaction,
  address,
}: {
  transaction: Types.Transaction;
  address?: string;
}) {
  const theme = useTheme();
  const semanticColors = getSemanticColors(theme.palette.mode);
  if (address !== undefined) {
    const amount = getCoinBalanceChangeForAccount(transaction, address);
    if (amount !== undefined) {
      let amountAbs = amount;
      let color = undefined;
      if (amount > 0) {
        color = semanticColors.status.info;
      } else if (amount < 0) {
        color = semanticColors.status.error;
        amountAbs = -amount;
      }

      return (
        <Box sx={{color: color}}>
          {amount > 0 && <>+</>}
          {amount < 0 && <>-</>}
          <APTCurrencyValue amount={amountAbs.toString()} />
        </Box>
      );
    }
  } else {
    const amount = getTransactionAmount(transaction);
    if (amount !== undefined) {
      return (
        <Box>
          <APTCurrencyValue amount={amount.toString()} />
        </Box>
      );
    }
  }

  return null;
}

function TransactionAmountGasCell({
  transaction,
  address,
}: TransactionCellProps) {
  const theme = useTheme();
  return (
    <GeneralTableCell sx={{paddingY: 1}}>
      <Stack sx={{textAlign: "right"}}>
        <TransactionAmount transaction={transaction} address={address} />
        <Box sx={{fontSize: 11, color: theme.palette.text.secondary}}>
          {"gas_used" in transaction && "gas_unit_price" in transaction ? (
            <>
              <>Gas</>{" "}
              <GasFeeValue
                gasUsed={transaction.gas_used}
                gasUnitPrice={transaction.gas_unit_price}
                transactionData={transaction}
                netGasCost
              />
            </>
          ) : null}
        </Box>
      </Stack>
    </GeneralTableCell>
  );
}

const TransactionCells = Object.freeze({
  sequenceNum: SequenceNumberCell,
  versionStatus: TransactionVersionStatusCell,
  type: TransactionTypeCell,
  timestamp: TransactionTimestampCell,
  sender: TransactionSenderCell,
  receiverOrCounterParty: TransactionReceiverOrCounterPartyCell,
  function: TransactionFunctionCell,
  amountGas: TransactionAmountGasCell,
});

// Transaction Detail Dialog for mobile view
type TransactionDetailDialogProps = {
  open: boolean;
  onClose: () => void;
  transaction: Types.Transaction;
  address?: string;
};

function TransactionDetailDialog({
  open,
  onClose,
  transaction,
  address,
}: TransactionDetailDialogProps) {
  const theme = useTheme();
  const semanticColors = getSemanticColors(theme.palette.mode);
  const navigate = useNavigate();
  const augmentTo = useAugmentToWithGlobalSearchParams();
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const version = "version" in transaction ? transaction.version : null;
  const timestamp =
    "timestamp" in transaction
      ? getTableFormattedTimestamp(transaction.timestamp)
      : "-";
  const counterparty = getTransactionCounterparty(transaction);
  const sender =
    transaction.type === TransactionTypeName.User
      ? (transaction as Types.UserTransaction).sender
      : null;

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleViewFullDetails = () => {
    onClose();
    if (version) {
      navigate({to: augmentTo(`/txn/${version}`)});
    }
  };

  // Check if transaction has a payload (for showing Function section)
  const hasPayload = "payload" in transaction;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 2,
          m: 2,
          maxHeight: "calc(100vh - 32px)",
        },
      }}
    >
      <DialogTitle sx={{pr: 6, pb: 1}}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h6" component="span">
            Transaction
          </Typography>
          <Link to={`/txn/${version}`} color="primary" sx={{fontWeight: 600}}>
            {version}
          </Link>
          {"success" in transaction && (
            <TableTransactionStatus success={transaction.success} />
          )}
        </Stack>
        <IconButton
          aria-label="Close dialog"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: theme.palette.text.secondary,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          {/* Type and Timestamp */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Type:
              </Typography>
              <TableTransactionType type={transaction.type} />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {timestamp}
            </Typography>
          </Stack>

          {/* Function */}
          {hasPayload && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{mb: 0.5}}>
                Function
              </Typography>
              <Box
                sx={{
                  p: 1.5,
                  backgroundColor: theme.palette.background.default,
                  borderRadius: 1,
                  wordBreak: "break-word",
                }}
              >
                <TransactionFunction transaction={transaction} />
              </Box>
            </Box>
          )}

          {/* Sender */}
          {sender && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{mb: 0.5}}>
                Sender
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <HashButton hash={sender} type={HashType.ACCOUNT} />
                <Tooltip
                  title={copiedField === "sender" ? "Copied!" : "Copy address"}
                >
                  <IconButton
                    aria-label="Copy sender address"
                    size="small"
                    onClick={() => handleCopy(sender, "sender")}
                  >
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>
          )}

          {/* Counterparty (Receiver/Contract) */}
          {counterparty && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{mb: 0.5}}>
                {counterparty.role === "smartContract"
                  ? "Contract"
                  : "Receiver"}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                {counterparty.role === "smartContract" ? (
                  <TextSnippetOutlined
                    sx={{fontSize: 18, color: theme.palette.text.secondary}}
                  />
                ) : (
                  <ArrowForwardOutlined
                    sx={{fontSize: 18, color: theme.palette.text.secondary}}
                  />
                )}
                <HashButton
                  hash={counterparty.address}
                  type={HashType.ACCOUNT}
                />
                <Tooltip
                  title={
                    copiedField === "counterparty" ? "Copied!" : "Copy address"
                  }
                >
                  <IconButton
                    aria-label="Copy counterparty address"
                    size="small"
                    onClick={() =>
                      handleCopy(counterparty.address, "counterparty")
                    }
                  >
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>
          )}

          {/* Amount */}
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{mb: 0.5}}>
              Amount
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 500,
                color: address
                  ? getCoinBalanceChangeForAccount(transaction, address) > 0
                    ? semanticColors.status.info
                    : getCoinBalanceChangeForAccount(transaction, address) < 0
                      ? semanticColors.status.error
                      : undefined
                  : undefined,
              }}
            >
              <TransactionAmount transaction={transaction} address={address} />
            </Typography>
          </Box>

          {/* Gas Fee */}
          {"gas_used" in transaction && "gas_unit_price" in transaction && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{mb: 0.5}}>
                Gas Fee
              </Typography>
              <Typography variant="body1">
                <GasFeeValue
                  gasUsed={transaction.gas_used}
                  gasUnitPrice={transaction.gas_unit_price}
                  transactionData={transaction}
                  netGasCost
                />
              </Typography>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{p: 2}}>
        <Button
          variant="contained"
          fullWidth
          onClick={handleViewFullDetails}
          endIcon={<OpenInNew />}
          sx={{borderRadius: 2}}
        >
          View Full Details
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Mobile card component for transactions
type TransactionCardProps = {
  transaction: Types.Transaction;
  address?: string;
};

function TransactionCard({transaction, address}: TransactionCardProps) {
  const theme = useTheme();
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const version = "version" in transaction ? transaction.version : null;
  const timestamp =
    "timestamp" in transaction
      ? getTableFormattedTimestamp(transaction.timestamp)
      : "-";
  const counterparty = getTransactionCounterparty(transaction);

  const handleClick = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  return (
    <>
      <Paper
        onClick={handleClick}
        sx={{
          px: 2,
          py: 1.5,
          mb: 1,
          cursor: "pointer",
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
          "&:hover": {
            filter:
              theme.palette.mode === "dark"
                ? "brightness(0.9)"
                : "brightness(0.99)",
          },
          "&:active": {
            background: theme.palette.neutralShade.main,
            transform: "translate(0,0.1rem)",
          },
        }}
      >
        {/* Row 1: Version, Type Icon, Status, Timestamp */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{mb: 0.75}}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              sx={{fontWeight: 600, fontSize: "0.9rem", color: "primary.main"}}
            >
              {version}
            </Typography>
            <TableTransactionType type={transaction.type} />
            {"success" in transaction && !transaction.success && (
              <TableTransactionStatus success={false} />
            )}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {timestamp}
          </Typography>
        </Stack>

        {/* Row 2: Function (full, wraps naturally) */}
        <Box sx={{mb: 0.5}}>
          <TransactionFunction
            transaction={transaction}
            sx={{
              fontSize: "0.85rem",
            }}
          />
        </Box>

        {/* Row 3: Counterparty + Amount/Gas */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box sx={{minWidth: 0, overflow: "hidden"}}>
            {counterparty && (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                {counterparty.role === "smartContract" ? (
                  <Tooltip title="Smart Contract" placement="top">
                    <TextSnippetOutlined
                      sx={{fontSize: 14, color: theme.palette.text.secondary}}
                    />
                  </Tooltip>
                ) : (
                  <Tooltip title="Receiver" placement="top">
                    <ArrowForwardOutlined
                      sx={{fontSize: 14, color: theme.palette.text.secondary}}
                    />
                  </Tooltip>
                )}
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontFamily: "monospace",
                  }}
                >
                  {truncateAddress(counterparty.address)}
                </Typography>
              </Stack>
            )}
          </Box>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{flexShrink: 0}}
          >
            <TransactionAmount transaction={transaction} address={address} />
            {"gas_used" in transaction && "gas_unit_price" in transaction && (
              <Typography
                variant="caption"
                sx={{color: theme.palette.text.secondary, fontSize: "0.75rem"}}
              >
                <GasFeeValue
                  gasUsed={transaction.gas_used}
                  gasUnitPrice={transaction.gas_unit_price}
                  transactionData={transaction}
                  netGasCost
                />
              </Typography>
            )}
          </Stack>
        </Stack>
      </Paper>

      <TransactionDetailDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        transaction={transaction}
        address={address}
      />
    </>
  );
}

type TransactionColumn = keyof typeof TransactionCells;

const DEFAULT_COLUMNS: TransactionColumn[] = [
  "versionStatus",
  "type",
  "timestamp",
  "sender",
  "receiverOrCounterParty",
  "function",
  "amountGas",
];

type TransactionRowProps = {
  transaction: Types.Transaction;
  columns: TransactionColumn[];
};

const TransactionRow = React.memo(function TransactionRow({
  transaction,
  columns,
}: TransactionRowProps) {
  return (
    <GeneralTableRow
      to={`/txn/${"version" in transaction && transaction.version}`}
    >
      {columns.map((column) => {
        const Cell = TransactionCells[column];
        return <Cell key={column} transaction={transaction} />;
      })}
    </GeneralTableRow>
  );
});

type UserTransactionRowProps = {
  version: number;
  columns: TransactionColumn[];
  address?: string;
};

const UserTransactionRow = React.memo(function UserTransactionRow({
  version,
  columns,
  address,
}: UserTransactionRowProps) {
  const {data: transaction, isError} = useGetTransaction(version.toString());

  if (!transaction || isError) {
    return null;
  }

  return (
    <GeneralTableRow to={`/txn/${version}`}>
      {columns.map((column) => {
        const Cell = TransactionCells[column];
        return (
          <Cell key={column} transaction={transaction} address={address} />
        );
      })}
    </GeneralTableRow>
  );
});

type TransactionHeaderCellProps = {
  column: TransactionColumn;
};

function TransactionHeaderCell({column}: TransactionHeaderCellProps) {
  switch (column) {
    case "sequenceNum":
      return <GeneralTableHeaderCell header="#" />;
    case "versionStatus":
      return <GeneralTableHeaderCell header="Version" />;
    case "type":
      return (
        <GeneralTableHeaderCell
          header="Type"
          tooltip={<TransactionTypeTooltip />}
          sx={{textAlign: "center"}}
        />
      );
    case "timestamp":
      return <GeneralTableHeaderCell header="Timestamp" />;
    case "sender":
      return <GeneralTableHeaderCell header="Sender" />;
    case "receiverOrCounterParty":
      return <GeneralTableHeaderCell header="Sent To" />;
    case "function":
      return <GeneralTableHeaderCell header="Function" />;
    case "amountGas":
      return <GeneralTableHeaderCell header="Amount" textAlignRight />;
    default:
      return assertNever(column);
  }
}

type TransactionsTableProps = {
  transactions: Types.Transaction[];
  columns?: TransactionColumn[];
  address?: string;
};

export default function TransactionsTable({
  transactions,
  columns = DEFAULT_COLUMNS,
  address,
}: TransactionsTableProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const rows = useMemo(
    () =>
      transactions.map((transaction, i) => (
        <TransactionRow
          key={`${i}-${transaction.hash}`}
          transaction={transaction}
          columns={columns}
        />
      )),
    [transactions, columns],
  );

  // Mobile card view
  if (isMobile) {
    return (
      <Box>
        {transactions.map((transaction, i) => (
          <TransactionCard
            key={`${i}-${transaction.hash}`}
            transaction={transaction}
            address={address}
          />
        ))}
      </Box>
    );
  }

  // Desktop table view
  return (
    <Box sx={{overflowX: "auto"}}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TransactionHeaderCell key={column} column={column} />
            ))}
          </TableRow>
        </TableHead>
        <VirtualizedTableBody
          estimatedRowHeight={65}
          virtualizationThreshold={15}
        >
          {rows}
        </VirtualizedTableBody>
      </Table>
    </Box>
  );
}

// Mobile card component for user transactions (fetches data)
type UserTransactionCardProps = {
  version: number;
  address?: string;
};

const UserTransactionCard = React.memo(function UserTransactionCard({
  version,
  address,
}: UserTransactionCardProps) {
  const {data: transaction, isError} = useGetTransaction(version.toString());

  if (!transaction || isError) {
    return null;
  }

  return <TransactionCard transaction={transaction} address={address} />;
});

type UserTransactionsTableProps = {
  versions: number[];
  columns?: TransactionColumn[];
  address?: string;
};

export function UserTransactionsTable({
  versions,
  columns = DEFAULT_COLUMNS,
  address,
}: UserTransactionsTableProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Mobile card view
  if (isMobile) {
    return (
      <Box>
        {versions.map((version, i) => (
          <UserTransactionCard
            key={`${i}-${version}`}
            version={version}
            address={address}
          />
        ))}
      </Box>
    );
  }

  // Desktop table view
  return (
    <Table>
      <TableHead>
        <TableRow>
          {columns.map((column) => (
            <TransactionHeaderCell key={column} column={column} />
          ))}
        </TableRow>
      </TableHead>
      <GeneralTableBody>
        {versions.map((version, i) => {
          return (
            <UserTransactionRow
              key={`${i}-${version}`}
              version={version}
              columns={columns}
              address={address}
            />
          );
        })}
      </GeneralTableBody>
    </Table>
  );
}
