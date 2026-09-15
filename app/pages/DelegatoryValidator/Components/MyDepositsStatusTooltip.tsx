import {
  Chip,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  SvgIcon,
  useTheme,
} from "@mui/material";
import TableTooltip from "../../../components/Table/TableTooltip";
import TooltipTypography from "../../../components/TooltipTypography";
import {useTranslation} from "../../../i18n";
import {StakingStatus} from "./StakingStatusIcon";
import type {StakingStatusInterface} from "./StakingStatusIcon";

type MyDepositsSectionProps = {
  steps: StakingStatusInterface[];
};

// TODO(jill): refactor step icon color scheme to override the default
export default function MyDepositsStatusTooltip({
  steps,
}: MyDepositsSectionProps) {
  const {t} = useTranslation();
  const theme = useTheme();

  return (
    <TableTooltip titleKey="staking.depositStatus">
      <Stepper orientation="vertical">
        {steps.map((step, index) => {
          const label =
            index === StakingStatus.STAKED
              ? t("staking.status.staked")
              : index === StakingStatus.WITHDRAW_PENDING
                ? t("staking.status.withdrawPending")
                : t("staking.status.withdrawReady");
          const description =
            index === StakingStatus.STAKED
              ? t("staking.status.stakedTip")
              : index === StakingStatus.WITHDRAW_PENDING
                ? t("staking.status.withdrawPendingTip")
                : t("staking.status.withdrawReadyTip");
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
                  label={label}
                  sx={
                    theme.palette.mode === "dark" ? step.sxDark : step.sxLight
                  }
                  color="primary"
                />
              </StepLabel>
              <StepContent>
                <TooltipTypography>{description}</TooltipTypography>
              </StepContent>
            </Step>
          );
        })}
      </Stepper>
    </TableTooltip>
  );
}
