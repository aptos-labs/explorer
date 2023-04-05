import {Chip, useTheme} from "@mui/material";
import React from "react";
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
} from "../constants";
import LockIcon from "@mui/icons-material/Lock";
import PendingIcon from "@mui/icons-material/Pending";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import GeneralTableCell from "../../../components/Table/GeneralTableCell";
import {ReactComponent as Counter1Logo} from "../../../assets/svg/stepper_counter_1.svg";
import {ReactComponent as Counter2Logo} from "../../../assets/svg/stepper_counter_2.svg";
import {ReactComponent as Counter3Logo} from "../../../assets/svg/stepper_counter_3.svg";

export enum StakingStatus {
  "STAKED",
  "WITHDRAW_PENDING",
  "WITHDRAW_READY",
}

export interface StakingStatusInterface {
  label: string;
  description: string;
  icon: JSX.Element;
  stepLabelIcon: React.FunctionComponent;
  sxLight: {
    color: string;
    backgroundColor: string;
  };
  sxDark: {
    color: string;
    backgroundColor: string;
  };
}

export const STAKING_STATUS_STEPS: StakingStatusInterface[] = [
  {
    label: STAKED_LABEL,
    description: STAKED_DESCRIPTION,
    icon: <LockIcon />,
    stepLabelIcon: Counter1Logo,
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
    stepLabelIcon: Counter2Logo,
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
    stepLabelIcon: Counter3Logo,
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

type StakingStatusIconProps = {
  status: number;
};

export default function StakingStatusIcon({status}: StakingStatusIconProps) {
  const theme = useTheme();

  const step = STAKING_STATUS_STEPS[status];
  return (
    <GeneralTableCell sx={{textAlign: "right"}}>
      <Chip
        icon={step.icon}
        label={step.label}
        sx={theme.palette.mode === "dark" ? step.sxDark : step.sxLight}
        color="primary"
      />
    </GeneralTableCell>
  );
}
