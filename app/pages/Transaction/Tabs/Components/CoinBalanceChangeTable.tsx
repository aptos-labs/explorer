import * as React from "react";
import {Table, TableHead, TableRow} from "@mui/material";
import GeneralTableRow from "../../../../components/Table/GeneralTableRow";
import GeneralTableHeaderCell from "../../../../components/Table/GeneralTableHeaderCell";
import {assertNever} from "../../../../utils";
import HashButton, {HashType} from "../../../../components/HashButton";
import {BalanceChange} from "../../utils";
import CurrencyValue, {
  getFormattedBalanceStr,
} from "../../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import {useTheme} from "@mui/material";
import {getSemanticColors} from "../../../../themes/colors/aptosBrandColors";
import {Types} from "aptos";
import GeneralTableBody from "../../../../components/Table/GeneralTableBody";
import GeneralTableCell from "../../../../components/Table/GeneralTableCell";
import {VerifiedCoinCell} from "../../../../components/Table/VerifiedCell";
import {getLearnMoreTooltip} from "../../helpers";
import {ContentCopy} from "@mui/icons-material";
import StyledTooltip from "../../../../components/StyledTooltip";
import {useGetFaMetadata} from "../../../../api/hooks/useGetFaMetadata";
import {isValidAccountAddress} from "../../../utils";

type BalanceChangeCellProps = {
  balanceChange: BalanceChange;
  transaction: Types.UserTransaction;
};

function AddressCell({balanceChange}: BalanceChangeCellProps) {
  return (
    <GeneralTableCell>
      {balanceChange.address ? (
        <HashButton hash={balanceChange.address} type={HashType.ACCOUNT} />
      ) : null}
    </GeneralTableCell>
  );
}

function TypeCell({balanceChange}: BalanceChangeCellProps) {
  return (
    <GeneralTableCell
      sx={{
        textAlign: "left",
      }}
    >
      {balanceChange.type}
    </GeneralTableCell>
  );
}

function VerifiedCell({balanceChange}: BalanceChangeCellProps) {
  return VerifiedCoinCell({
    data: {
      id: balanceChange?.asset?.id,
      known: balanceChange.known,
      isBanned: balanceChange.isBanned,
      isInPanoraTokenList: balanceChange.isInPanoraTokenList,
      symbol: balanceChange?.asset?.symbol,
    },
  });
}

function TokenInfoCell({balanceChange}: BalanceChangeCellProps) {
  const assetId = balanceChange.asset.id;
  const isFa = isValidAccountAddress(assetId);

  const {data: metadata} = useGetFaMetadata(balanceChange.asset.id, {
    enabled: balanceChange.logoUrl === undefined && isFa,
  });

  return (
    <GeneralTableCell sx={{}}>
      <HashButton
        hash={balanceChange.asset.id}
        type={
          balanceChange?.asset?.id?.includes("::")
            ? HashType.COIN
            : HashType.FUNGIBLE_ASSET
        }
        size="large"
        img={balanceChange.logoUrl || metadata?.icon_uri}
      />
    </GeneralTableCell>
  );
}

function AmountCell({balanceChange}: BalanceChangeCellProps) {
  const theme = useTheme();
  const semanticColors = getSemanticColors(theme.palette.mode);
  const isNegative = balanceChange.amount < 0;
  const amount =
    balanceChange.amount < 0 ? -balanceChange.amount : balanceChange.amount;
  const [showCopied, setShowCopied] = React.useState(false);

  const handleCopy = async () => {
    const formattedValue = getFormattedBalanceStr(
      amount.toString(),
      balanceChange.asset.decimals,
    );
    await navigator.clipboard.writeText(
      `${isNegative ? "-" : ""}${formattedValue}`,
    );
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 1500);
  };

  return (
    <GeneralTableCell
      sx={{
        textAlign: "right",
        color: isNegative
          ? semanticColors.status.error
          : theme.palette.primary.main,
      }}
      onClick={handleCopy}
    >
      {isNegative ? "-" : "+"}
      <CurrencyValue
        amount={amount.toString()}
        currencyCode={balanceChange.asset.symbol}
        decimals={balanceChange.asset.decimals}
      />{" "}
      <StyledTooltip open={showCopied} title="Copied!" placement="top">
        <ContentCopy style={{height: "1rem", width: "1.25rem"}} />
      </StyledTooltip>
    </GeneralTableCell>
  );
}

const BalanceChangeCells = Object.freeze({
  address: AddressCell,
  type: TypeCell,
  tokenInfo: TokenInfoCell,
  verified: VerifiedCell,
  amount: AmountCell,
});

type Column = keyof typeof BalanceChangeCells;

const DEFAULT_COLUMNS: Column[] = [
  "address",
  "type",
  "tokenInfo",
  "verified",
  "amount",
];

type BalanceChangeRowProps = {
  balanceChange: BalanceChange;
  transaction: Types.UserTransaction;
  columns: Column[];
};

function BalanceChangeRow({
  balanceChange,
  transaction,
  columns,
}: BalanceChangeRowProps) {
  return (
    <GeneralTableRow>
      {columns.map((column) => {
        const Cell = BalanceChangeCells[column];
        return (
          <Cell
            key={column}
            balanceChange={balanceChange}
            transaction={transaction}
          />
        );
      })}
    </GeneralTableRow>
  );
}

type BalanceChangeHeaderCellProps = {
  column: Column;
};

function BalanceChangeHeaderCell({column}: BalanceChangeHeaderCellProps) {
  switch (column) {
    case "address":
      return <GeneralTableHeaderCell header="Account" />;
    case "type":
      return <GeneralTableHeaderCell header="Event Type" />;
    case "tokenInfo":
      return <GeneralTableHeaderCell header="Asset" />;
    case "verified":
      return (
        <GeneralTableHeaderCell
          header="Verified"
          tooltip={getLearnMoreTooltip("coin_verification")}
          isTableTooltip={true}
        />
      );
    case "amount":
      return <GeneralTableHeaderCell header="Change" textAlignRight={true} />;
    default:
      return assertNever(column);
  }
}

type CoinBalanceChangeTableProps = {
  balanceChanges: BalanceChange[];
  transaction: Types.UserTransaction;
  columns?: Column[];
};

export function CoinBalanceChangeTable({
  balanceChanges,
  transaction,
  columns = DEFAULT_COLUMNS,
}: CoinBalanceChangeTableProps) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          {columns.map((column) => (
            <BalanceChangeHeaderCell key={column} column={column} />
          ))}
        </TableRow>
      </TableHead>
      <GeneralTableBody>
        {balanceChanges.map((balanceChange, i) => {
          return (
            <BalanceChangeRow
              key={i}
              balanceChange={balanceChange}
              transaction={transaction}
              columns={columns}
            />
          );
        })}
      </GeneralTableBody>
    </Table>
  );
}
