import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import GeneralTableRow from "../../components/GeneralTableRow";
import GeneralTableHeaderCell from "../../components/GeneralTableHeaderCell";
import {assertNever} from "../../utils";
import {Validator} from "../../api/hooks/useGetValidatorSet";
import HashButton, {HashType} from "../../components/HashButton";
import {getFormattedBalanceStr} from "../../components/IndividualPageContent/ContentValue/CurrencyValue";

type ValidatorCellProps = {
  validator: Validator;
};

function ValidatorIndexCell({validator}: ValidatorCellProps) {
  return (
    <TableCell sx={{textAlign: "left"}}>
      {validator.config.validator_index}
    </TableCell>
  );
}

function ValidatorAddrCell({validator}: ValidatorCellProps) {
  return (
    <TableCell sx={{textAlign: "left"}}>
      <HashButton hash={validator.addr} type={HashType.ACCOUNT} />
    </TableCell>
  );
}

function VotingPowerCell({validator}: ValidatorCellProps) {
  return (
    <TableCell sx={{textAlign: "left"}}>
      {getFormattedBalanceStr(validator.voting_power.toString(), undefined, 3)}
    </TableCell>
  );
}

function ConsensusPKCell({validator}: ValidatorCellProps) {
  return (
    <TableCell sx={{textAlign: "left"}}>
      <HashButton
        hash={validator.config.consensus_pubkey}
        type={HashType.OTHERS}
      />
    </TableCell>
  );
}

function FullnodeAddrCell({validator}: ValidatorCellProps) {
  return (
    <TableCell sx={{textAlign: "left"}}>
      <HashButton
        hash={validator.config.fullnode_addresses}
        type={HashType.OTHERS}
      />
    </TableCell>
  );
}

function NetworkAddrCell({validator}: ValidatorCellProps) {
  return (
    <TableCell sx={{textAlign: "left"}}>
      <HashButton
        hash={validator.config.network_addresses}
        type={HashType.OTHERS}
      />
    </TableCell>
  );
}

const ValidatorCells = Object.freeze({
  idx: ValidatorIndexCell,
  addr: ValidatorAddrCell,
  votingPower: VotingPowerCell,
  consensusPK: ConsensusPKCell,
  fullnodeAddr: FullnodeAddrCell,
  networkAddr: NetworkAddrCell,
});

type Column = keyof typeof ValidatorCells;

const DEFAULT_COLUMNS: Column[] = [
  "idx",
  "addr",
  "votingPower",
  "consensusPK",
  "fullnodeAddr",
  "networkAddr",
];

type ValidatorRowProps = {
  validator: Validator;
  columns: Column[];
};

function ValidatorRow({validator, columns}: ValidatorRowProps) {
  return (
    <GeneralTableRow onClick={() => {}} clickDisabled>
      {columns.map((column) => {
        const Cell = ValidatorCells[column];
        return <Cell key={column} validator={validator} />;
      })}
    </GeneralTableRow>
  );
}

type ValidatorHeaderCellProps = {
  column: Column;
};

function ValidatorHeaderCell({column}: ValidatorHeaderCellProps) {
  switch (column) {
    case "idx":
      return <GeneralTableHeaderCell header="#" />;
    case "addr":
      return <GeneralTableHeaderCell header="Address" />;
    case "votingPower":
      return <GeneralTableHeaderCell header="Voting Power" />;
    case "consensusPK":
      return <GeneralTableHeaderCell header="Consensus Pubkey" />;
    case "fullnodeAddr":
      return <GeneralTableHeaderCell header="Fullnode Address" />;
    case "networkAddr":
      return <GeneralTableHeaderCell header="Network Address" />;
    default:
      return assertNever(column);
  }
}

type ValidatorsTableProps = {
  validators: Validator[];
  columns?: Column[];
};

export function ValidatorsTable({
  validators,
  columns = DEFAULT_COLUMNS,
}: ValidatorsTableProps) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          {columns.map((column) => (
            <ValidatorHeaderCell key={column} column={column} />
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {validators.map((validator: any, i: number) => {
          return (
            <ValidatorRow key={i} validator={validator} columns={columns} />
          );
        })}
      </TableBody>
    </Table>
  );
}
