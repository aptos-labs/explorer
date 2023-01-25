import {
  Chip,
  Stack,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  useTheme,
} from "@mui/material";
import React from "react";
import TableTooltip from "../../../components/Table/TableTooltip";
import LockIcon from "@mui/icons-material/Lock";
import TooltipTypography from "../../../components/TooltipTypography";
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
} from "../constants";

export default function MyDepositsStatusTooltip() {
  const theme = useTheme();
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

  return (
    <TableTooltip title="Deposit Status">
      <Stack>
        <Stepper orientation="vertical">
          {steps.map((step) => (
            <Step key={step.label} active={true}>
              <StepLabel>
                <Chip
                  icon={step.icon}
                  label={step.label}
                  sx={
                    theme.palette.mode === "dark" ? step.sxDark : step.sxLight
                  }
                  color="primary"
                />
              </StepLabel>
              <StepContent>
                <TooltipTypography>{step.description}</TooltipTypography>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Stack>
    </TableTooltip>
  );
}
