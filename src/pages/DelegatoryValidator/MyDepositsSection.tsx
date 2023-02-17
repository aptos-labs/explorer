import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {
  Button,
  Stack,
  Table,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {Types} from "aptos";
import React, {useState} from "react";
import {useGetDelegatorStakeInfo} from "../../api/hooks/useGetDelegatorStakeInfo";
import {APTCurrencyValue} from "../../components/IndividualPageContent/ContentValue/CurrencyValue";
import TimestampValue from "../../components/IndividualPageContent/ContentValue/TimestampValue";
import GeneralTableBody from "../../components/Table/GeneralTableBody";
import GeneralTableCell from "../../components/Table/GeneralTableCell";
import GeneralTableHeaderCell from "../../components/Table/GeneralTableHeaderCell";
import GeneralTableRow from "../../components/Table/GeneralTableRow";
import MyDepositsStatusTooltip from "./Components/MyDepositsStatusTooltip";
import StakingStatusIcon, {
  STAKING_STATUS_STEPS,
} from "./Components/StakingStatusIcon";
import UnstakeDialog from "./UnstakeDialog";
import {getLockedUtilSecs} from "./utils";
import WalletConnectionDialog from "./WalletConnectionDialog";

const MyDepositsCells = Object.freeze({
  amount: AmountCell,
  status: StatusCell,
  unlockDate: UnlockDateCell,
  rewardEarned: RewardEarnedCell,
  actions: ActionsCell,
});

type Column = keyof typeof MyDepositsCells;

const MyDepositsHeader: {[key in Column]: string} = Object.freeze({
  amount: "Amount",
  status: "Status",
  unlockDate: "Unlock Date",
  rewardEarned: "Reward Earned",
  actions: "Actions",
});

const DEFAULT_COLUMNS: Column[] = [
  "amount",
  "status",
  "unlockDate",
  "rewardEarned",
  "actions",
];

const DEFAULT_COLUMNS_MOBILE: Column[] = [
  "amount",
  "status",
  "unlockDate",
  "rewardEarned",
];

type MyDepositsSectionCellProps = {
  handleClickOpen: () => void;
  accountResource?: Types.MoveResource | undefined;
  stake: Types.MoveValue;
  status: number;
};

function AmountCell({stake}: MyDepositsSectionCellProps) {
  return (
    <GeneralTableCell>
      <APTCurrencyValue amount={stake.toString()} />
    </GeneralTableCell>
  );
}

function StatusCell({status}: MyDepositsSectionCellProps) {
  return <StakingStatusIcon status={status} />;
}

function UnlockDateCell({accountResource}: MyDepositsSectionCellProps) {
  const lockedUntilSecs = getLockedUtilSecs(accountResource);
  if (!lockedUntilSecs) {
    return null;
  }
  return (
    <GeneralTableCell>
      <TimestampValue timestamp={lockedUntilSecs?.toString()!} />
    </GeneralTableCell>
  );
}

function RewardEarnedCell({}: MyDepositsSectionCellProps) {
  return (
    <GeneralTableCell>
      <APTCurrencyValue amount={""} />
    </GeneralTableCell>
  );
}

function ActionsCell({handleClickOpen}: MyDepositsSectionCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "right"}}>
      <Button variant="primary" size="small" onClick={handleClickOpen}>
        <Typography>UNSTAKE</Typography>
      </Button>
    </GeneralTableCell>
  );
}

type MyDepositsSectionProps = {
  accountResource?: Types.MoveResource | undefined;
};

type MyDepositRowProps = {
  stake: Types.MoveValue;
  status: number;
};

export default function MyDepositsSection({
  accountResource,
}: MyDepositsSectionProps) {
  const theme = useTheme();
  const isOnMobile = !useMediaQuery(theme.breakpoints.up("md"));
  const columns = isOnMobile ? DEFAULT_COLUMNS_MOBILE : DEFAULT_COLUMNS;
  const {connected, account} = useWallet();
  const {stakes} = useGetDelegatorStakeInfo(account?.address!);

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const handleClickOpen = () => {
    setDialogOpen(true);
  };
  const handleClose = () => {
    setDialogOpen(false);
  };

  function MyDepositRow({stake, status}: MyDepositRowProps) {
    return (
      <GeneralTableRow>
        {columns.map((deposit) => {
          const Cell = MyDepositsCells[deposit];
          return (
            <Cell
              key={deposit}
              accountResource={accountResource}
              handleClickOpen={handleClickOpen}
              stake={stake}
              status={status}
            />
          );
        })}
      </GeneralTableRow>
    );
  }

  return (
    <Stack>
      <Typography variant="h5" marginX={1}>
        My Deposits
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((columnName, idx) => (
              <GeneralTableHeaderCell
                sx={{
                  textAlign:
                    idx === DEFAULT_COLUMNS.length - 1 ? "right" : null,
                }}
                header={MyDepositsHeader[columnName]}
                key={idx}
                tooltip={
                  columnName === "status" && (
                    <MyDepositsStatusTooltip steps={STAKING_STATUS_STEPS} />
                  )
                }
              />
            ))}
          </TableRow>
        </TableHead>
        <GeneralTableBody>
          {stakes.map(
            (stake, idx) =>
              Number(stake) !== 0 && (
                <MyDepositRow key={idx} stake={stake} status={idx} />
              ),
          )}
        </GeneralTableBody>
      </Table>
      {connected ? (
        <UnstakeDialog
          handleDialogClose={handleClose}
          isDialogOpen={dialogOpen}
          accountResource={accountResource}
        />
      ) : (
        <WalletConnectionDialog
          handleDialogClose={handleClose}
          isDialogOpen={dialogOpen}
        />
      )}
    </Stack>
  );
}
