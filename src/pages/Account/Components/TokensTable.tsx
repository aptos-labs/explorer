import * as React from "react";
import {Box} from "@mui/material";
import * as RRD from "react-router-dom";
import {Link, Table, TableHead, TableRow} from "@mui/material";
import GeneralTableRow from "../../../components/Table/GeneralTableRow";
import GeneralTableHeaderCell from "../../../components/Table/GeneralTableHeaderCell";
import {assertNever} from "../../../utils";
import GeneralTableBody from "../../../components/Table/GeneralTableBody";
import GeneralTableCell from "../../../components/Table/GeneralTableCell";
import {useNavigateWithParams} from "../../../api/hooks/useNavigateWithParams";

type TokenCellProps = {
  token: any; // TODO: add graphql data typing
};

function TokenNameCell({token}: TokenCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "left"}}>
      <Link
        component={RRD.Link}
        to={`/token/${token?.token_data_id_hash}/${token?.property_version}`}
        color="primary"
        underline="none"
      >
        <Box
          sx={{
            maxWidth: {xs: 150, md: 250, lg: 400},
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {token?.name}
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
      {token?.collection_name}
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
      {token?.table_type}
    </GeneralTableCell>
  );
}

function PropertyVersionCell({token}: TokenCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "right"}}>
      {token?.property_version}
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

const TokenCells = Object.freeze({
  name: TokenNameCell,
  collectionName: CollectionNameCell,
  store: StoreCell,
  propertyVersion: PropertyVersionCell,
  amount: AmountCell,
});

type Column = keyof typeof TokenCells;

const DEFAULT_COLUMNS: Column[] = [
  "name",
  "collectionName",
  "store",
  "propertyVersion",
  "amount",
];

type TokenRowProps = {
  token: any; // TODO: add graphql data typing
  columns: Column[];
};

function TokenRow({token, columns}: TokenRowProps) {
  const navigateWithParams = useNavigateWithParams();

  const rowClick = () => {
    navigateWithParams(
      `/token/${token?.token_data_id_hash}/${token?.property_version}`,
    );
  };

  return (
    <GeneralTableRow onClick={rowClick}>
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
      return <GeneralTableHeaderCell header="Version" textAlignRight={true} />;
    case "amount":
      return <GeneralTableHeaderCell header="Amount" textAlignRight={true} />;
    default:
      return assertNever(column);
  }
}

type TokensTableProps = {
  tokens: any; // TODO: add graphql data typing
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
