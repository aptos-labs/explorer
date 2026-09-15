import {Box, Stack, Typography, useTheme} from "@mui/material";
import type React from "react";
import {type TranslateVars, useTranslation} from "../../i18n";
import EmptyValue from "./ContentValue/EmptyValue";

type ContentRowSmallProps = {
  title?: string;
  titleKey?: string;
  titleVars?: TranslateVars;
  value: React.ReactNode;
  tooltip?: React.ReactNode;
  i?: string | number;
};

export default function ContentRowSpaceBetween({
  title,
  titleKey,
  titleVars,
  value,
  tooltip,
}: ContentRowSmallProps) {
  const theme = useTheme();
  const {t} = useTranslation();
  const displayTitle = titleKey ? t(titleKey, titleVars) : (title ?? "");
  return (
    <Stack
      direction="row"
      sx={{
        justifyContent: "space-between",
      }}
    >
      <Stack
        direction="row"
        spacing={0.5}
        sx={{
          alignItems: "center",
        }}
      >
        <Typography
          sx={{fontSize: "0.875rem", color: theme.palette.text.secondary}}
        >
          {displayTitle}
        </Typography>
        {tooltip}
      </Stack>
      <Box
        sx={{
          fontSize: "0.8rem",
          overflow: "hidden",
          wordBreak: "break-word",
          overflowWrap: "anywhere",
        }}
      >
        {value ? <Box>{value}</Box> : <EmptyValue />}
      </Box>
    </Stack>
  );
}
