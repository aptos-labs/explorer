import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import GeneralTableRow from "../../components/Table/GeneralTableRow";
import GeneralTableHeaderCell from "../../components/Table/GeneralTableHeaderCell";
import {assertNever} from "../../utils";
import HashButton, {HashType} from "../../components/HashButton";
import {Types} from "aptos";
import {useNavigate} from "react-router-dom";
import {parseTimestamp} from "../utils";
import moment from "moment";
import {Link} from "@mui/material";

function getAgeInSeconds(block: Types.Block): string {
  const blockTimestamp = parseTimestamp(block.block_timestamp);
  const nowTimestamp = parseTimestamp(moment.now().toString());
  const duration = moment.duration(nowTimestamp.diff(blockTimestamp));
  const durationInSec = duration.asSeconds().toFixed(0);
  return durationInSec;
}

function VersionValue({block}: {block: Types.Block}) {
  const {first_version, last_version} = block;
  return (
    <>
      <Link href={`/txn/${first_version}`} underline="none">
        {first_version}
      </Link>
      {" - "}
      <Link href={`/txn/${last_version}`} underline="none">
        {last_version}
      </Link>
    </>
  );
}

type BlockCellProps = {
  block: Types.Block;
};

function BlockHeightCell({block}: BlockCellProps) {
  return (
    <TableCell sx={{textAlign: "left"}}>
      <Link href={`/block/${block.block_height}`} underline="none">
        {block.block_height}
      </Link>
    </TableCell>
  );
}

function BlockAgeCell({block}: BlockCellProps) {
  return (
    <TableCell sx={{textAlign: "left"}}>{`${getAgeInSeconds(
      block,
    )}s ago`}</TableCell>
  );
}

function BlockHashCell({block}: BlockCellProps) {
  return (
    <TableCell sx={{textAlign: "left"}}>
      <HashButton hash={block.block_hash} type={HashType.OTHERS} />
    </TableCell>
  );
}

function FirstVersionCell({block}: BlockCellProps) {
  return (
    <TableCell sx={{textAlign: "right"}}>
      <Link href={`/txn/${block.first_version}`} underline="none">
        {block.first_version}
      </Link>
    </TableCell>
  );
}

function LastVersionCell({block}: BlockCellProps) {
  return (
    <TableCell sx={{textAlign: "right"}}>
      <Link href={`/txn/${block.last_version}`} underline="none">
        {block.last_version}
      </Link>
    </TableCell>
  );
}

const BlockCells = Object.freeze({
  height: BlockHeightCell,
  age: BlockAgeCell,
  hash: BlockHashCell,
  firstVersion: FirstVersionCell,
  lastVersion: LastVersionCell,
});

type Column = keyof typeof BlockCells;

const DEFAULT_COLUMNS: Column[] = [
  "height",
  "age",
  "hash",
  "firstVersion",
  "lastVersion",
];

type BlockRowProps = {
  block: Types.Block;
  columns: Column[];
};

function BlockRow({block, columns}: BlockRowProps) {
  const navigate = useNavigate();
  const rowClick = () => {
    navigate(`/block/${block.block_height}`);
  };

  return (
    <GeneralTableRow onClick={rowClick}>
      {columns.map((column) => {
        const Cell = BlockCells[column];
        return <Cell key={column} block={block} />;
      })}
    </GeneralTableRow>
  );
}

type BlockHeaderCellProps = {
  column: Column;
};

function BlockHeaderCell({column}: BlockHeaderCellProps) {
  switch (column) {
    case "height":
      return <GeneralTableHeaderCell header="Block" />;
    case "age":
      return <GeneralTableHeaderCell header="Age" />;
    case "hash":
      return <GeneralTableHeaderCell header="Hash" />;
    case "firstVersion":
      return <GeneralTableHeaderCell header="First Version" textAlignRight />;
    case "lastVersion":
      return <GeneralTableHeaderCell header="Last Version" textAlignRight />;
    default:
      return assertNever(column);
  }
}

type BlocksTableProps = {
  blocks: Types.Block[];
  columns?: Column[];
};

export default function BlocksTable({
  blocks,
  columns = DEFAULT_COLUMNS,
}: BlocksTableProps) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          {columns.map((column) => (
            <BlockHeaderCell key={column} column={column} />
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {blocks.map((block: any, i: number) => {
          return <BlockRow key={i} block={block} columns={columns} />;
        })}
      </TableBody>
    </Table>
  );
}
