import * as React from "react";
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
import HashButton, {HashType} from "../../../components/HashButton";

type ActivityCellProps = {
  activity: any; // TODO: add graphql data typing
};

function TransactionVersionCell({activity}: ActivityCellProps) {
  return (
    <TableCell sx={{textAlign: "left"}}>
      <Link
        component={RRD.Link}
        to={`/txn/${
          "transaction_version" in activity && activity.transaction_version
        }`}
        color="primary"
        underline="none"
      >
        {activity?.transaction_version}
      </Link>
    </TableCell>
  );
}

function TransferTypeCell({activity}: ActivityCellProps) {
  return (
    <TableCell sx={{textAlign: "left"}}>{activity?.transfer_type}</TableCell>
  );
}

function FromCell({activity}: ActivityCellProps) {
  return (
    <TableCell sx={{textAlign: "left"}}>
      {activity?.from_address === null ? null : (
        <HashButton hash={activity?.from_address} type={HashType.ACCOUNT} />
      )}
    </TableCell>
  );
}

function ToCell({activity}: ActivityCellProps) {
  return (
    <TableCell sx={{textAlign: "left"}}>
      {activity?.to_address === null ? null : (
        <HashButton hash={activity?.to_address} type={HashType.ACCOUNT} />
      )}
    </TableCell>
  );
}

function PropertyVersionCell({activity}: ActivityCellProps) {
  return (
    <TableCell sx={{textAlign: "right"}}>
      {activity?.property_version}
    </TableCell>
  );
}

function AmountCell({activity}: ActivityCellProps) {
  return (
    <TableCell sx={{textAlign: "right"}}>{activity?.token_amount}</TableCell>
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
  activity: any; // TODO: add graphql data typing
  columns: Column[];
};

function ActivityRow({activity, columns}: ActivityRowProps) {
  const navigate = useNavigate();

  const rowClick = () => {
    navigate(
      `/activity/${
        "activity_data_id_hash" in activity && activity.activity_data_id_hash
      }`,
    );
  };

  return (
    <GeneralTableRow onClick={rowClick}>
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
  activities: any[]; // TODO: add graphql data typing
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
      <TableBody>
        {activities.map((activity: any, i: number) => {
          return <ActivityRow key={i} activity={activity} columns={columns} />;
        })}
      </TableBody>
    </Table>
  );
}
