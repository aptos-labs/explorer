import * as React from "react";
import {Table, TableHead, TableRow} from "@mui/material";
import GeneralTableRow from "../../components/Table/GeneralTableRow";
import GeneralTableHeaderCell from "../../components/Table/GeneralTableHeaderCell";
import {assertNever} from "../../utils";
import HashButton, {HashType} from "../../components/HashButton";
import {Types} from "aptos";
import {parseTimestamp} from "../utils";
import moment from "moment";
import GeneralTableBody from "../../components/Table/GeneralTableBody";
import GeneralTableCell from "../../components/Table/GeneralTableCell";
import {Link, useAugmentToWithGlobalSearchParams} from "../../routing";

function getAgeInSeconds(block: Types.Block): string {
  const blockTimestamp = parseTimestamp(block.block_timestamp);
  const nowTimestamp = parseTimestamp(moment.now().toString());
  const duration = moment.duration(nowTimestamp.diff(blockTimestamp));
  return duration.asSeconds().toFixed(0);
}

type BlockCellProps = {
  block: Types.Block;
};

function BlockHeightCell({block}: BlockCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "left"}}>
      <Link to={`/block/${block.block_height}`} underline="none">
        {block.block_height}
      </Link>
    </GeneralTableCell>
  );
}

function BlockAgeCell({block}: BlockCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "left"}}>
      {`${getAgeInSeconds(block)}s ago`}
    </GeneralTableCell>
  );
}

function BlockHashCell({block}: BlockCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "left"}}>
      <HashButton hash={block.block_hash} type={HashType.OTHERS} />
    </GeneralTableCell>
  );
}

function CountVersionCell({block}: BlockCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "right"}}>
      {(
        BigInt(block.last_version) -
        BigInt(block.first_version) +
        BigInt(1)
      ).toString()}
    </GeneralTableCell>
  );
}

function FirstVersionCell({block}: BlockCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "right"}}>
      <Link to={`/txn/${block.first_version}`} underline="none">
        {block.first_version}
      </Link>
    </GeneralTableCell>
  );
}

function LastVersionCell({block}: BlockCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "right"}}>
      <Link to={`/txn/${block.last_version}`} underline="none">
        {block.last_version}
      </Link>
    </GeneralTableCell>
  );
}

const BlockCells = Object.freeze({
  height: BlockHeightCell,
  age: BlockAgeCell,
  hash: BlockHashCell,
  numVersions: CountVersionCell,
  firstVersion: FirstVersionCell,
  lastVersion: LastVersionCell,
});

type Column = keyof typeof BlockCells;

const DEFAULT_COLUMNS: Column[] = [
  "height",
  "age",
  "hash",
  "numVersions",
  "firstVersion",
  "lastVersion",
];

type BlockRowProps = {
  block: Types.Block;
  columns: Column[];
};

function BlockRow({block, columns}: BlockRowProps) {
  const augmentTo = useAugmentToWithGlobalSearchParams();

  return (
    <GeneralTableRow to={augmentTo(`/block/${block.block_height}`)}>
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
    case "numVersions":
      return (
        <GeneralTableHeaderCell header="Num Transactions" textAlignRight />
      );
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
  // TODO: Fix this better than this change here, this seems to be a bug elsewhere that I'm trying to fix on first load of page
  if (!Array.isArray(blocks)) {
    blocks = [blocks];
  }
  return (
    <Table>
      <TableHead>
        <TableRow>
          {columns.map((column) => (
            <BlockHeaderCell key={column} column={column} />
          ))}
        </TableRow>
      </TableHead>
      <GeneralTableBody>
        {blocks &&
          blocks.map((block: Types.Block, i: number) => {
            return <BlockRow key={i} block={block} columns={columns} />;
          })}
      </GeneralTableBody>
    </Table>
  );
}
