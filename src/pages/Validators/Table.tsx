import * as React from "react";
import {Table, TableHead, TableRow} from "@mui/material";
import GeneralTableRow from "../../components/Table/GeneralTableRow";
import GeneralTableHeaderCell from "../../components/Table/GeneralTableHeaderCell";
import {assertNever} from "../../utils";
import {
  useGetValidatorSet,
  Validator,
} from "../../api/hooks/useGetValidatorSet";
import HashButton, {HashType} from "../../components/HashButton";
import {getFormattedBalanceStr} from "../../components/IndividualPageContent/ContentValue/CurrencyValue";
import GeneralTableBody from "../../components/Table/GeneralTableBody";
import GeneralTableCell from "../../components/Table/GeneralTableCell";
import {CommissionCell, DelegatorCell, MyDepositCell} from "./ValidatorsTable";
import {useGetInDevMode} from "../../api/hooks/useGetInDevMode";
import {useNavigate} from "react-router-dom";
import {Types} from "aptos";

type ValidatorCellProps = {
  validator: Validator;
};

function ValidatorIndexCell({validator}: ValidatorCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "left"}}>
      {validator.config.validator_index}
    </GeneralTableCell>
  );
}

function ValidatorAddrCell({validator}: ValidatorCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "left"}}>
      <HashButton hash={validator.addr} type={HashType.ACCOUNT} />
    </GeneralTableCell>
  );
}

function VotingPowerCell({validator}: ValidatorCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "right"}}>
      {getFormattedBalanceStr(validator.voting_power.toString(), undefined, 3)}
    </GeneralTableCell>
  );
}

function ConsensusPKCell({validator}: ValidatorCellProps) {
  return (
    <GeneralTableCell>
      <HashButton
        hash={validator.config.consensus_pubkey}
        type={HashType.OTHERS}
        sx={{display: "flex", justifyContent: "flex-end"}}
      />
    </GeneralTableCell>
  );
}

function FullnodeAddrCell({validator}: ValidatorCellProps) {
  return (
    <GeneralTableCell>
      <HashButton
        hash={validator.config.fullnode_addresses}
        type={HashType.OTHERS}
        sx={{display: "flex", justifyContent: "flex-end"}}
      />
    </GeneralTableCell>
  );
}

function NetworkAddrCell({validator}: ValidatorCellProps) {
  return (
    <GeneralTableCell>
      <HashButton
        hash={validator.config.network_addresses}
        type={HashType.OTHERS}
        sx={{display: "flex", justifyContent: "flex-end"}}
      />
    </GeneralTableCell>
  );
}

const ValidatorCells = Object.freeze({
  idx: ValidatorIndexCell,
  addr: ValidatorAddrCell,
  votingPower: VotingPowerCell,
  consensusPK: ConsensusPKCell,
  fullnodeAddr: FullnodeAddrCell,
  networkAddr: NetworkAddrCell,
  delegator: DelegatorCell,
  myDeposit: MyDepositCell,
  commission: CommissionCell,
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

const DELEGATORY_VALIDATOR_COLUMNS: Column[] = [
  "idx",
  "addr",
  "votingPower",
  "commission",
  "delegator",
  "myDeposit",
];

type ValidatorRowProps = {
  validator: Validator;
  columns: Column[];
};

function ValidatorRow({validator, columns}: ValidatorRowProps) {
  const inDev = useGetInDevMode();
  const navigate = useNavigate();

  const rowClick = (address: Types.Address) => {
    navigate(`/validator/${address}`);
  };

  return (
    <GeneralTableRow
      onClick={inDev ? () => rowClick(validator.addr) : undefined}
    >
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
      return <GeneralTableHeaderCell header="Voting Power" textAlignRight />;
    case "consensusPK":
      return (
        <GeneralTableHeaderCell header="Consensus Pubkey" textAlignRight />
      );
    case "fullnodeAddr":
      return (
        <GeneralTableHeaderCell header="Fullnode Address" textAlignRight />
      );
    case "networkAddr":
      return <GeneralTableHeaderCell header="Network Address" textAlignRight />;
    case "delegator":
      return <GeneralTableHeaderCell header="Delegators" textAlignRight />;
    case "commission":
      return <GeneralTableHeaderCell header="Commission" textAlignRight />;
    case "myDeposit":
      return <GeneralTableHeaderCell header="My Deposit" textAlignRight />;
    default:
      return assertNever(column);
  }
}

type ValidatorsTableProps = {
  onDelegatory: boolean;
};

export function ValidatorsTable({onDelegatory}: ValidatorsTableProps) {
  const {activeValidators} = useGetValidatorSet();

  const validatorsCopy: Validator[] = JSON.parse(
    JSON.stringify(activeValidators),
  );
  const validatorsInOrder = validatorsCopy.sort(
    (validator1, validator2) =>
      parseInt(validator2.voting_power) - parseInt(validator1.voting_power),
  );
  const columns = onDelegatory ? DELEGATORY_VALIDATOR_COLUMNS : DEFAULT_COLUMNS;

  return (
    <Table>
      <TableHead>
        <TableRow>
          {columns.map((column) => (
            <ValidatorHeaderCell key={column} column={column} />
          ))}
        </TableRow>
      </TableHead>
      <GeneralTableBody>
        {validatorsInOrder.map((validator: any, i: number) => {
          return (
            <ValidatorRow key={i} validator={validator} columns={columns} />
          );
        })}
      </GeneralTableBody>
    </Table>
  );
}
