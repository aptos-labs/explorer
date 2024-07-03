import * as React from "react";
import {Box} from "@mui/material";
import {Table, TableHead, TableRow} from "@mui/material";
import GeneralTableRow from "../../../components/Table/GeneralTableRow";
import GeneralTableHeaderCell from "../../../components/Table/GeneralTableHeaderCell";
import {assertNever} from "../../../utils";
import GeneralTableBody from "../../../components/Table/GeneralTableBody";
import GeneralTableCell from "../../../components/Table/GeneralTableCell";
import {Link} from "../../../routing";
import {TokenOwnership} from "../../../api/hooks/useGetAccountTokens";

type TokenCellProps = {
  token: TokenOwnership;
};

function TokenNameCell({token}: TokenCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "left"}}>
      <Link
        to={`/token/${token?.current_token_data?.token_data_id}/${
          token?.property_version_v1 ?? 0
        }`}
        color="primary"
      >
        <Box
          sx={{
            maxWidth: {xs: 150, md: 250, lg: 400},
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {token?.current_token_data?.token_name}
        </Box>
      </Link>
    </GeneralTableCell>
  );
}

// TODO: link to collection page
function CollectionNameCell({token}: TokenCellProps) {
  return (
    <GeneralTableCell
      sx={{
        textAlign: "left",
        maxWidth: {xs: 150, md: 250, lg: 400},
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {token?.current_token_data?.current_collection?.collection_name}
    </GeneralTableCell>
  );
}

function StoreCell({token}: TokenCellProps) {
  return (
    <GeneralTableCell
      sx={{
        textAlign: "left",
        maxWidth: {xs: 150, md: 250, lg: 400},
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {token?.table_type_v1}
    </GeneralTableCell>
  );
}

function PropertyVersionCell({token}: TokenCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "right"}}>
      {token?.property_version_v1}
    </GeneralTableCell>
  );
}

function AmountCell({token}: TokenCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "right"}}>
      {token?.amount}
    </GeneralTableCell>
  );
}

function TypeCell({token}: TokenCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "right"}}>
      {token?.token_standard}
    </GeneralTableCell>
  );
}

const TokenCells = Object.freeze({
  name: TokenNameCell,
  collectionName: CollectionNameCell,
  store: StoreCell,
  propertyVersion: PropertyVersionCell,
  type: TypeCell,
  amount: AmountCell,
});

type Column = keyof typeof TokenCells;

const DEFAULT_COLUMNS: Column[] = [
  "name",
  "collectionName",
  "store",
  "propertyVersion",
  "type",
  "amount",
];

type TokenRowProps = {
  token: any; // TODO: add graphql data typing
  columns: Column[];
};

function TokenRow({token, columns}: TokenRowProps) {
  return (
    <GeneralTableRow
      to={`/token/${token?.current_token_data?.token_data_id}/${
        token?.property_version_v1 ?? 0
      }`}
    >
      {columns.map((column) => {
        const Cell = TokenCells[column];
        return <Cell key={column} token={token} />;
      })}
    </GeneralTableRow>
  );
}

type TokenHeaderCellProps = {
  column: Column;
};

function TokenHeaderCell({column}: TokenHeaderCellProps) {
  switch (column) {
    case "name":
      return <GeneralTableHeaderCell header="Name" />;
    case "collectionName":
      return <GeneralTableHeaderCell header="Collection" />;
    case "store":
      return <GeneralTableHeaderCell header="Store" />;
    case "propertyVersion":
      return <GeneralTableHeaderCell header="Version" textAlignRight />;
    case "type":
      return <GeneralTableHeaderCell header="Type" textAlignRight />;
    case "amount":
      return <GeneralTableHeaderCell header="Amount" textAlignRight />;
    default:
      return assertNever(column);
  }
}

type TokensTableProps = {
  tokens: TokenOwnership[];
  columns?: Column[];
};

export function TokensTable({
  tokens,
  columns = DEFAULT_COLUMNS,
}: TokensTableProps) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          {columns.map((column) => (
            <TokenHeaderCell key={column} column={column} />
          ))}
        </TableRow>
      </TableHead>
      <GeneralTableBody>
        {tokens.map((token: any, i: number) => {
          return <TokenRow key={i} token={token} columns={columns} />;
        })}
      </GeneralTableBody>
    </Table>
  );
}
