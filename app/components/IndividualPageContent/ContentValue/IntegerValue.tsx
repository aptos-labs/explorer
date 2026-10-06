import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {IconButton, Stack, Typography, useTheme} from "@mui/material";
import type React from "react";
import {useState} from "react";
import {canonicalIntegerString} from "../../../i18n/format";
import {useTranslation} from "../../../i18n";
import {Link} from "../../../routing";
import StyledTooltip from "../../StyledTooltip";

const TOOLTIP_TIME = 2000;

type IntegerValueProps = {
  value: string | number | bigint | null | undefined;
  copyable?: boolean;
  /** When set, the formatted number (not the copy control) links here. */
  to?: string;
};

export default function IntegerValue({
  value,
  copyable = false,
  to,
}: IntegerValueProps) {
  const {t, formatIntegerString} = useTranslation();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const theme = useTheme();
  const color = theme.palette.text.secondary;

  if (value === null || value === undefined || value === "") {
    return null;
  }

  const canonical = canonicalIntegerString(value);
  const formatted = formatIntegerString(String(value));
  const numberNode = to ? (
    <Link to={to} underline="none">
      {formatted}
    </Link>
  ) : (
    formatted
  );

  if (!copyable) {
    return <>{numberNode}</>;
  }

  const copyNumber = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    await navigator.clipboard.writeText(canonical);
    setTooltipOpen(true);
    setTimeout(() => {
      setTooltipOpen(false);
    }, TOOLTIP_TIME);
  };

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        alignItems: "center",
        display: "inline-flex",
      }}
    >
      <Typography
        component="span"
        sx={{
          fontSize: "inherit",
          fontWeight: "inherit",
        }}
      >
        {numberNode}
      </Typography>
      <StyledTooltip
        title={t("common.numberCopied")}
        placement="right"
        open={tooltipOpen}
        disableFocusListener
        disableHoverListener
        disableTouchListener
      >
        <IconButton
          onClick={copyNumber}
          sx={{padding: 0.6}}
          aria-label={t("common.copyValueAria", {value: canonical})}
        >
          <ContentCopyIcon sx={{color: color, fontSize: 15}} />
        </IconButton>
      </StyledTooltip>
    </Stack>
  );
}
