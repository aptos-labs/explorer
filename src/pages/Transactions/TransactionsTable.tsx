import * as React from "react";
import {Box, Stack, useTheme} from "@mui/material";
import * as RRD from "react-router-dom";
import Link from "@mui/material/Link";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import {useNavigate} from "react-router-dom";
import GeneralTableRow from "../../components/Table/GeneralTableRow";
import GeneralTableHeaderCell from "../../components/Table/GeneralTableHeaderCell";
import HashButton, {HashType} from "../../components/HashButton";
import {Types} from "aptos";
import {assertNever} from "../../utils";
import {TableTransactionType} from "../../components/TransactionType";
import {TableTransactionStatus} from "../../components/TransactionStatus";
import {getTableFormattedTimestamp} from "../utils";
import GasFeeValue from "../../components/IndividualPageContent/ContentValue/GasFeeValue";
import {useGetTransaction} from "../../api/hooks/useGetTransaction";
import TransactionTypeTooltip from "../../components/Table/TransactionTypeTooltip";
import {
  getUserTransferOrInteractionInfo,
  UserTransferInfo,
  UserInteractionInfo,
} from "../Transaction/Tabs/UserTransactionOverviewTab";
import {APTCurrencyValue} from "../../components/IndividualPageContent/ContentValue/CurrencyValue";
import GeneralTableCell from "../../components/Table/GeneralTableCell";
import GeneralTableBody from "../../components/Table/GeneralTableBody";
import {CodeLine} from "../../components/IndividualPageContent/JsonCard";
import {grey} from "../../themes/colors/aptosColorPalette";

type TransactionCellProps = {
  transaction: Types.Transaction;
  transferOrInteractionInfo: UserTransferInfo | UserInteractionInfo | undefined;
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
          component={RRD.Link}
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
  if (transaction.type === "user_transaction") {
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
  transferOrInteractionInfo,
}: TransactionCellProps) {
  return (
    <GeneralTableCell>
      {transferOrInteractionInfo && "receiver" in transferOrInteractionInfo && (
        <HashButton
          hash={transferOrInteractionInfo.receiver}
          type={HashType.ACCOUNT}
        />
      )}
      {transferOrInteractionInfo &&
        "counterParty" in transferOrInteractionInfo && (
          <HashButton
            hash={transferOrInteractionInfo.counterParty}
            type={HashType.ACCOUNT}
          />
        )}
    </GeneralTableCell>
  );
}

function TransactionFunctionCell({transaction}: TransactionCellProps) {
  if (!("payload" in transaction) || !("function" in transaction.payload)) {
    return <GeneralTableCell />;
  }

  const functionFullStr = transaction.payload.function;
  const functionStrStartIdx = functionFullStr.indexOf("::") + 2;
  const functionStr = functionFullStr.substring(functionStrStartIdx);

  return (
    <GeneralTableCell
      sx={{
        maxWidth: 300,
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
      }}
    >
      <CodeLine data={functionStr} />
    </GeneralTableCell>
  );
}

function TransactionAmountGasCell({
  transaction,
  transferOrInteractionInfo,
}: TransactionCellProps) {
  return (
    <GeneralTableCell sx={{paddingY: 1}}>
      <Stack sx={{textAlign: "right"}}>
        <Box>
          {transferOrInteractionInfo?.amount ? (
            <APTCurrencyValue amount={transferOrInteractionInfo.amount} />
          ) : null}
        </Box>
        <Box sx={{fontSize: 11, color: grey[450]}}>
          <>Gas </>
          {"gas_used" in transaction && "gas_unit_price" in transaction ? (
            <GasFeeValue
              gasUsed={transaction.gas_used}
              gasUnitPrice={transaction.gas_unit_price}
            />
          ) : null}
        </Box>
      </Stack>
    </GeneralTableCell>
  );
}

function TransactionAmountCell({
  transferOrInteractionInfo,
}: TransactionCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "right"}}>
      {transferOrInteractionInfo?.amount ? (
        <APTCurrencyValue
          amount={transferOrInteractionInfo.amount}
          fixedDecimalPlaces={2}
        />
      ) : null}
    </GeneralTableCell>
  );
}

function TransactionGasCell({transaction}: TransactionCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "right"}}>
      {"gas_used" in transaction && "gas_unit_price" in transaction ? (
        <GasFeeValue
          gasUsed={transaction.gas_used}
          gasUnitPrice={transaction.gas_unit_price}
        />
      ) : null}
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

function TransactionRow({transaction, columns}: TransactionRowProps) {
  const navigate = useNavigate();

  const rowClick = () => {
    navigate(`/txn/${"version" in transaction && transaction.version}`);
  };

  return (
    <GeneralTableRow onClick={rowClick}>
      {columns.map((column) => {
        const Cell = TransactionCells[column];
        const transferOrInteractionInfo =
          getUserTransferOrInteractionInfo(transaction);
        return (
          <Cell
            key={column}
            transaction={transaction}
            transferOrInteractionInfo={transferOrInteractionInfo}
          />
        );
      })}
    </GeneralTableRow>
  );
}

type UserTransactionRowProps = {
  version: number;
  columns: TransactionColumn[];
};

function UserTransactionRow({version, columns}: UserTransactionRowProps) {
  const navigate = useNavigate();
  const {data: transaction, isError} = useGetTransaction(version.toString());

  if (!transaction || isError) {
    return null;
  }

  const rowClick = () => {
    navigate(`/txn/${version}`);
  };

  return (
    <GeneralTableRow onClick={rowClick}>
      {columns.map((column) => {
        const Cell = TransactionCells[column];
        const transferOrInteractionInfo =
          getUserTransferOrInteractionInfo(transaction);
        return (
          <Cell
            key={column}
            transaction={transaction}
            transferOrInteractionInfo={transferOrInteractionInfo}
          />
        );
      })}
    </GeneralTableRow>
  );
}

type TransactionHeaderCellProps = {
  column: TransactionColumn;
};

function TransactionHeaderCell({column}: TransactionHeaderCellProps) {
  const theme = useTheme();

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
      return <GeneralTableHeaderCell header="Interact with" />;
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
};

export default function TransactionsTable({
  transactions,
  columns = DEFAULT_COLUMNS,
}: TransactionsTableProps) {
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
        {transactions.map((transaction, i) => {
          return (
            <TransactionRow
              key={`${i}-${transaction.hash}`}
              transaction={transaction}
              columns={columns}
            />
          );
        })}
      </GeneralTableBody>
    </Table>
  );
}

type UserTransactionsTableProps = {
  versions: number[];
  columns?: TransactionColumn[];
};

export function UserTransactionsTable({
  versions,
  columns = DEFAULT_COLUMNS,
}: UserTransactionsTableProps) {
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
            />
          );
        })}
      </GeneralTableBody>
    </Table>
  );
}
