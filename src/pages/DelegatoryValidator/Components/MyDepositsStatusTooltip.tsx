import {
  Chip,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  useTheme,
} from "@mui/material";
import React from "react";
import TableTooltip from "../../../components/Table/TableTooltip";
import TooltipTypography from "../../../components/TooltipTypography";
import {StakingStatusInterface} from "./StakingStatusIcon";
import {SvgIcon} from "@mui/material";

type MyDepositsSectionProps = {
  steps: StakingStatusInterface[];
};

// TODO(jill): refactor step icon color scheme to override the default
export default function MyDepositsStatusTooltip({
  steps,
}: MyDepositsSectionProps) {
  const theme = useTheme();

  return (
    <TableTooltip title="Deposit Status">
      <Stepper orientation="vertical">
        {steps.map((step) => {
          return (
            <Step key={step.label} active={false} expanded={true}>
              <StepLabel
                icon={<SvgIcon component={step.stepLabelIcon} inheritViewBox />}
                sx={{
                  color: theme.palette.text.primary,
                }}
              >
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
          );
        })}
      </Stepper>
    </TableTooltip>
  );
}
