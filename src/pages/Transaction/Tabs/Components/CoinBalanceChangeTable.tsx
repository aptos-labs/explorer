import * as React from "react";
import {Stack, Table, TableHead, TableRow} from "@mui/material";
import GeneralTableRow from "../../../../components/Table/GeneralTableRow";
import GeneralTableHeaderCell from "../../../../components/Table/GeneralTableHeaderCell";
import {assertNever} from "../../../../utils";
import HashButton, {HashType} from "../../../../components/HashButton";
import {BalanceChange} from "../../utils";
import CurrencyValue from "../../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import {
  negativeColor,
  primary,
} from "../../../../themes/colors/aptosColorPalette";
import {Types} from "aptos";
import GeneralTableBody from "../../../../components/Table/GeneralTableBody";
import GeneralTableCell from "../../../../components/Table/GeneralTableCell";
import VerifiedOutlined from "@mui/icons-material/VerifiedOutlined";
import {
  WarningOutlined,
  DangerousOutlined,
  VerifiedUserOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material";
import StyledTooltip from "../../../../components/StyledTooltip";
import {LearnMoreTooltip} from "../../../../components/IndividualPageContent/LearnMoreTooltip";
import {APTOS_COIN} from "@aptos-labs/ts-sdk";

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

enum VerifiedType {
  NATIVE_TOKEN,
  COMMUNITY_VERIFIED,
  UNVERIFIED,
  BANNED,
  UNKNOWN,
}

function verifiedLevel(balanceChange: BalanceChange): VerifiedType {
  if (
    balanceChange?.asset?.id === APTOS_COIN ||
    balanceChange?.asset?.id === "0xA"
  ) {
    return VerifiedType.NATIVE_TOKEN;
  } else if (balanceChange?.isBanned) {
    return VerifiedType.BANNED;
  } else if (balanceChange.isInPanoraTokenList) {
    return VerifiedType.COMMUNITY_VERIFIED;
  } else if (balanceChange.known) {
    return VerifiedType.UNVERIFIED;
  } else {
    return VerifiedType.UNKNOWN;
  }
}

function VerifiedCell({balanceChange}: BalanceChangeCellProps) {
  const level = verifiedLevel(balanceChange);
  return (
    <GeneralTableCell
      sx={{
        textAlign: "left",
      }}
    >
      {level === VerifiedType.NATIVE_TOKEN ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <StyledTooltip title="This asset is verified as a native token of Aptos.">
            <VerifiedUserOutlined fontSize="small" />
          </StyledTooltip>
        </Stack>
      ) : level === VerifiedType.COMMUNITY_VERIFIED ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <StyledTooltip title="This asset is verified by the community on the Panora token list.">
            <VerifiedOutlined fontSize="small" />
          </StyledTooltip>
        </Stack>
      ) : level === VerifiedType.BANNED ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <StyledTooltip title="This asset has been banned on the Panora token list, please use with caution.">
            <DangerousOutlined fontSize="small" />
          </StyledTooltip>
        </Stack>
      ) : level === VerifiedType.UNVERIFIED ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <StyledTooltip title="This asset is recognized, but not been verified by the community.">
            <WarningAmberOutlined fontSize="small" />
          </StyledTooltip>
        </Stack>
      ) : (
        <Stack direction="row" spacing={1} alignItems="center">
          <StyledTooltip title="This asset is not verified, it may or may not be recognized by the community.">
            <WarningOutlined fontSize="small" />
          </StyledTooltip>
        </Stack>
      )}
    </GeneralTableCell>
  );
}

function TokenInfoCell({balanceChange}: BalanceChangeCellProps) {
  return (
    <GeneralTableCell sx={{}}>
      <HashButton
        hash={balanceChange.asset.id}
        type={
          balanceChange.asset.id.includes("::")
            ? HashType.COIN
            : HashType.FUNGIBLE_ASSET
        }
        img={balanceChange.logoUrl}
      />
    </GeneralTableCell>
  );
}

function AmountCell({balanceChange}: BalanceChangeCellProps) {
  const isNegative = balanceChange.amount < 0;
  const amount =
    balanceChange.amount < 0 ? -balanceChange.amount : balanceChange.amount;

  return (
    <GeneralTableCell
      sx={{
        textAlign: "right",
        color: isNegative ? negativeColor : primary[600],
      }}
    >
      {isNegative ? "-" : "+"}
      <CurrencyValue
        amount={amount.toString()}
        currencyCode={balanceChange.asset.symbol}
        decimals={balanceChange.asset.decimals}
      />
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
          tooltip={
            <LearnMoreTooltip
              text="This uses the Panora token list to verify authenticity of known assets on-chain.  It does not guarantee anything else about the asset."
              link="https://github.com/PanoraExchange/Aptos-Tokens"
            />
          }
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
