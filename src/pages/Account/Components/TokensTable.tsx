import * as React from "react";
import {useTheme} from "@mui/material";
import * as RRD from "react-router-dom";
import Link from "@mui/material/Link";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import {useNavigate} from "react-router-dom";
import GeneralTableRow from "../../../components/GeneralTableRow";
import GeneralTableHeaderCell from "../../../components/GeneralTableHeaderCell";
import {assertNever} from "../../../utils";

type TokenCellProps = {
  token: any; // TODO: add graphql data typing
};

function TokenNameCell({token}: TokenCellProps) {
  return (
    <TableCell sx={{textAlign: "left"}}>
      <Link
        component={RRD.Link}
        to={`/token/${token?.token_data_id_hash}/${token?.property_version}`}
        color="primary"
        underline="none"
      >
        {token?.name}
      </Link>
    </TableCell>
  );
}

// TODO: link to collection page
function CollectionNameCell({token}: TokenCellProps) {
  return (
    <TableCell sx={{textAlign: "left"}}>{token?.collection_name}</TableCell>
  );
}

function StoreCell({token}: TokenCellProps) {
  return <TableCell sx={{textAlign: "left"}}>{token?.table_type}</TableCell>;
}

function PropertyVersionCell({token}: TokenCellProps) {
  return (
    <TableCell sx={{textAlign: "right"}}>{token?.property_version}</TableCell>
  );
}

function AmountCell({token}: TokenCellProps) {
  return <TableCell sx={{textAlign: "right"}}>{token?.amount}</TableCell>;
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
  const navigate = useNavigate();

  const rowClick = () => {
    navigate(`/token/${token?.token_data_id_hash}/${token?.property_version}`);
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
  const theme = useTheme();

  switch (column) {
    case "name":
      return <GeneralTableHeaderCell header="Name" />;
    case "collectionName":
      return <GeneralTableHeaderCell header="Collection" />;
    case "store":
      return <GeneralTableHeaderCell header="Store" />;
    case "propertyVersion":
      return (
        <GeneralTableHeaderCell
          header="Property Version"
          textAlignRight={true}
        />
      );
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
      <TableBody>
        {tokens.map((token: any, i: number) => {
          return <TokenRow key={i} token={token} columns={columns} />;
        })}
      </TableBody>
    </Table>
  );
}
