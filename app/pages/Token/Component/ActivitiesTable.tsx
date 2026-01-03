import * as React from "react";
import {Table, TableHead, TableRow} from "@mui/material";
import GeneralTableRow from "../../../components/Table/GeneralTableRow";
import GeneralTableHeaderCell from "../../../components/Table/GeneralTableHeaderCell";
import {assertNever} from "../../../utils";
import HashButton, {HashType} from "../../../components/HashButton";
import GeneralTableBody from "../../../components/Table/GeneralTableBody";
import GeneralTableCell from "../../../components/Table/GeneralTableCell";
import {Link} from "../../../routing";
import {GetTokenActivityResponse} from "@aptos-labs/ts-sdk";

type ActivityCellProps = {
  activity: GetTokenActivityResponse[0];
};

function TransactionVersionCell({activity}: ActivityCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "left"}}>
      <Link
        to={`/txn/${
          "transaction_version" in activity && activity.transaction_version
        }`}
        color="primary"
        underline="none"
      >
        {activity?.transaction_version}
      </Link>
    </GeneralTableCell>
  );
}

function TransferTypeCell({activity}: ActivityCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "left"}}>
      {activity?.type}
    </GeneralTableCell>
  );
}

function FromCell({activity}: ActivityCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "left"}}>
      {activity?.from_address === null ? null : (
        <HashButton
          hash={activity?.from_address ?? ""}
          type={HashType.ACCOUNT}
        />
      )}
    </GeneralTableCell>
  );
}

function ToCell({activity}: ActivityCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "left"}}>
      {activity?.to_address === null ? null : (
        <HashButton hash={activity?.to_address ?? ""} type={HashType.ACCOUNT} />
      )}
    </GeneralTableCell>
  );
}

function PropertyVersionCell({activity}: ActivityCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "right"}}>
      {activity?.property_version_v1}
    </GeneralTableCell>
  );
}

function AmountCell({activity}: ActivityCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "right"}}>
      {activity?.token_amount}
    </GeneralTableCell>
  );
}

const ActivityCells = Object.freeze({
  txn: TransactionVersionCell,
  type: TransferTypeCell,
  from: FromCell,
  to: ToCell,
  propertyVersion: PropertyVersionCell,
  amount: AmountCell,
});

type Column = keyof typeof ActivityCells;

const DEFAULT_COLUMNS: Column[] = [
  "txn",
  "type",
  "from",
  "to",
  "propertyVersion",
  "amount",
];

type ActivityRowProps = {
  activity: GetTokenActivityResponse[0];
  columns: Column[];
};

function ActivityRow({activity, columns}: ActivityRowProps) {
  return (
    <GeneralTableRow>
      {columns.map((column) => {
        const Cell = ActivityCells[column];
        return <Cell key={column} activity={activity} />;
      })}
    </GeneralTableRow>
  );
}

type ActivityHeaderCellProps = {
  column: Column;
};

function ActivityHeaderCell({column}: ActivityHeaderCellProps) {
  switch (column) {
    case "txn":
      return <GeneralTableHeaderCell header="Transaction" />;
    case "type":
      return <GeneralTableHeaderCell header="Transfer Type" />;
    case "from":
      return <GeneralTableHeaderCell header="From" />;
    case "to":
      return <GeneralTableHeaderCell header="To" />;
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

type ActivitiesTableProps = {
  activities: GetTokenActivityResponse; // TODO: add graphql data typing
  columns?: Column[];
};

export function ActivitiesTable({
  activities,
  columns = DEFAULT_COLUMNS,
}: ActivitiesTableProps) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          {columns.map((column) => (
            <ActivityHeaderCell key={column} column={column} />
          ))}
        </TableRow>
      </TableHead>
      <GeneralTableBody>
        {activities.map((activity, i: number) => {
          return <ActivityRow key={i} activity={activity} columns={columns} />;
        })}
      </GeneralTableBody>
    </Table>
  );
}
