import {
  Button,
  Chip,
  Stack,
  Table,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {Types} from "aptos";
import React from "react";
import {APTCurrencyValue} from "../../components/IndividualPageContent/ContentValue/CurrencyValue";
import TimestampValue from "../../components/IndividualPageContent/ContentValue/TimestampValue";
import GeneralTableBody from "../../components/Table/GeneralTableBody";
import GeneralTableCell from "../../components/Table/GeneralTableCell";
import GeneralTableHeaderCell from "../../components/Table/GeneralTableHeaderCell";
import GeneralTableRow from "../../components/Table/GeneralTableRow";
import MyDepositsStatusTooltip from "./Components/MyDepositsStatusTooltip";
import {getLockedUtilSecs} from "./utils";
import LockIcon from "@mui/icons-material/Lock";
import PendingIcon from "@mui/icons-material/Pending";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  STAKED_BACKGROUND_COLOR_DARK,
  STAKED_BACKGROUND_COLOR_LIGHT,
  STAKED_DESCRIPTION,
  STAKED_LABEL,
  STAKED_TEXT_COLOR_DARK,
  STAKED_TEXT_COLOR_LIGHT,
  WITHDRAW_PENDING_BACKGROUND_COLOR_DARK,
  WITHDRAW_PENDING_BACKGROUND_COLOR_LIGHT,
  WITHDRAW_PENDING_DESCRIPTION,
  WITHDRAW_PENDING_LABEL,
  WITHDRAW_PENDING_TEXT_COLOR_DARK,
  WITHDRAW_PENDING_TEXT_COLOR_LIGHT,
  WITHDRAW_READY_BACKGROUND_COLOR_DARK,
  WITHDRAW_READY_BACKGROUND_COLOR_LIGHT,
  WITHDRAW_READY_DESCRIPTION,
  WITHDRAW_READY_LABEL,
  WITHDRAW_READY_TEXT_COLOR_DARK,
  WITHDRAW_READY_TEXT_COLOR_LIGHT,
} from "./constants";

enum StakingStatusStep {
  "staked",
  "withdrawPending",
  "withdrawReady",
}
type Steps = keyof typeof StakingStatusStep;

export interface StakingStatusStepInterface {
  label: string;
  description: string;
  icon: JSX.Element;
  sxLight: {
    color: string;
    backgroundColor: string;
  };
  sxDark: {
    color: string;
    backgroundColor: string;
  };
}

const steps = [
  {
    label: STAKED_LABEL,
    description: STAKED_DESCRIPTION,
    icon: <LockIcon />,
    sxLight: {
      color: STAKED_TEXT_COLOR_LIGHT,
      backgroundColor: STAKED_BACKGROUND_COLOR_LIGHT,
    },
    sxDark: {
      color: STAKED_TEXT_COLOR_DARK,
      backgroundColor: STAKED_BACKGROUND_COLOR_DARK,
    },
  },
  {
    label: WITHDRAW_PENDING_LABEL,
    description: WITHDRAW_PENDING_DESCRIPTION,
    icon: <PendingIcon />,
    sxLight: {
      color: WITHDRAW_PENDING_TEXT_COLOR_LIGHT,
      backgroundColor: WITHDRAW_PENDING_BACKGROUND_COLOR_LIGHT,
    },
    sxDark: {
      color: WITHDRAW_PENDING_TEXT_COLOR_DARK,
      backgroundColor: WITHDRAW_PENDING_BACKGROUND_COLOR_DARK,
    },
  },
  {
    label: WITHDRAW_READY_LABEL,
    description: WITHDRAW_READY_DESCRIPTION,
    icon: <CheckCircleIcon />,
    sxLight: {
      color: WITHDRAW_READY_TEXT_COLOR_LIGHT,
      backgroundColor: WITHDRAW_READY_BACKGROUND_COLOR_LIGHT,
    },
    sxDark: {
      color: WITHDRAW_READY_TEXT_COLOR_DARK,
      backgroundColor: WITHDRAW_READY_BACKGROUND_COLOR_DARK,
    },
  },
];

type MyDepositsSectionProps = {
  accountResource?: Types.MoveResource | undefined;
};

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

function AmountCell({}: MyDepositsSectionProps) {
  return (
    <GeneralTableCell>
      <APTCurrencyValue amount={""} />
    </GeneralTableCell>
  );
}

function StatusCell({}: MyDepositsSectionProps) {
  const theme = useTheme();

  // TODO(jill): temp workaround since we don't have status data yet
  const step = steps[0];
  return (
    <GeneralTableCell>
      <Chip
        icon={step.icon}
        label={step.label}
        sx={theme.palette.mode === "dark" ? step.sxDark : step.sxLight}
        color="primary"
      />
    </GeneralTableCell>
  );
}

function UnlockDateCell({accountResource}: MyDepositsSectionProps) {
  const lockedUntilSecs = getLockedUtilSecs(accountResource);
  return (
    <GeneralTableCell>
      <TimestampValue timestamp={lockedUntilSecs?.toString()!} />
    </GeneralTableCell>
  );
}

function RewardEarnedCell({}: MyDepositsSectionProps) {
  return (
    <GeneralTableCell>
      <APTCurrencyValue amount={""} />
    </GeneralTableCell>
  );
}

function ActionsCell({}: MyDepositsSectionProps) {
  return (
    <GeneralTableCell sx={{textAlign: "right"}}>
      <Button variant="primary" size="small">
        <Typography>UNSTAKE</Typography>
      </Button>
    </GeneralTableCell>
  );
}

export default function MyDepositsSection({
  accountResource,
}: MyDepositsSectionProps) {
  const theme = useTheme();
  const isOnMobile = !useMediaQuery(theme.breakpoints.up("md"));
  const columns = isOnMobile ? DEFAULT_COLUMNS_MOBILE : DEFAULT_COLUMNS;

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
                    <MyDepositsStatusTooltip
                      steps={steps as [StakingStatusStepInterface]}
                    />
                  )
                }
              />
            ))}
          </TableRow>
        </TableHead>
        <GeneralTableBody>
          <GeneralTableRow>
            {columns.map((deposit) => {
              const Cell = MyDepositsCells[deposit];
              return <Cell key={deposit} accountResource={accountResource} />;
            })}
          </GeneralTableRow>
        </GeneralTableBody>
      </Table>
    </Stack>
  );
}
