import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DangerousIcon from "@mui/icons-material/Dangerous";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import PendingIcon from "@mui/icons-material/Pending";
import {Chip, useTheme} from "@mui/material";
import type React from "react";
import {getValidatorStatusColors} from "../../../themes/colors/aptosBrandColors";
import {useTranslation} from "../../../i18n";
import type {ValidatorStatus} from "../utils";

export default function ValidatorStatusIcon({
  validatorStatus,
}: {
  validatorStatus: ValidatorStatus | undefined;
}): React.JSX.Element | null {
  const {t} = useTranslation();
  const theme = useTheme();
  const statusColors = getValidatorStatusColors(theme.palette.mode);

  const getStatusIcon = () => {
    if (validatorStatus) {
      switch (validatorStatus) {
        case "Pending Active":
          return (
            <Chip
              label={t("staking.status.pendingActive")}
              color={"warning"}
              icon={<PendingIcon />}
              sx={{
                color: statusColors.pendingActive.text,
                backgroundColor: statusColors.pendingActive.background,
              }}
            />
          );
        case "Active":
          return (
            <Chip
              label={t("staking.status.active")}
              color={"primary"}
              icon={<CheckCircleIcon />}
              sx={{
                color: statusColors.active.text,
                backgroundColor: statusColors.active.background,
              }}
            />
          );
        case "Pending Inactive":
          return (
            <Chip
              label={t("staking.status.pendingInactive")}
              color={"warning"}
              icon={<MoreHorizIcon />}
              sx={{
                color: statusColors.pendingInactive.text,
                backgroundColor: statusColors.pendingInactive.background,
              }}
            />
          );
        case "Inactive":
          return (
            <Chip
              label={t("staking.status.inactive")}
              color={"error"}
              icon={<DangerousIcon />}
              sx={{
                color: statusColors.inactive.text,
                backgroundColor: statusColors.inactive.background,
              }}
            />
          );
        default:
          return null;
      }
    }
    return null;
  };

  return getStatusIcon();
}
