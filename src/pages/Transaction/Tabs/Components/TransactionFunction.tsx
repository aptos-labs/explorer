import React from "react";
import {Box, Stack, SxProps, Theme, useTheme} from "@mui/material";
import {Types} from "aptos";
import CurrencyExchangeOutlinedIcon from "@mui/icons-material/CurrencyExchangeOutlined";

const TEXT_COLOR_LIGHT = "#0EA5E9";
const TEXT_COLOR_DARK = "#83CCED";
const BACKGROUND_COLOR = "rgba(14,165,233,0.1)";

function CodeLineBox({
  children,
  sx,
}: {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}) {
  const theme = useTheme();
  return (
    <Box
      sx={[
        {
          width: "max-content",
          color:
            theme.palette.mode === "dark" ? TEXT_COLOR_DARK : TEXT_COLOR_LIGHT,
          backgroundColor: BACKGROUND_COLOR,
          padding: "0.35rem 1rem 0.35rem 1rem",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          fontFamily: theme.typography.fontFamily,
          fontWeight: theme.typography.fontWeightRegular,
          fontSize: 13,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      borderRadius={1}
    >
      {children}
    </Box>
  );
}

function CodeLine({
  data,
  sx,
}: {
  data: string;
  sx?: SxProps<Theme>;
}): JSX.Element {
  return (
    <CodeLineBox sx={[...(Array.isArray(sx) ? sx : [sx])]}>{data}</CodeLineBox>
  );
}

function CoinTransferCodeLine({sx}: {sx?: SxProps<Theme>}): JSX.Element {
  return (
    <CodeLineBox sx={[...(Array.isArray(sx) ? sx : [sx])]}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <CurrencyExchangeOutlinedIcon sx={{fontSize: 17, padding: 0}} />
        <Box>{`Coin Transfer`}</Box>
      </Stack>
    </CodeLineBox>
  );
}

export default function TransactionFunction({
  transaction,
  sx,
}: {
  transaction: Types.Transaction;
  sx?: SxProps<Theme>;
}) {
  if (!("payload" in transaction) || !("function" in transaction.payload)) {
    return null;
  }

  const functionFullStr = transaction.payload.function;

  if (
    functionFullStr === "0x1::coin::transfer" ||
    functionFullStr === "0x1::aptos_account::transfer"
  ) {
    return <CoinTransferCodeLine sx={[...(Array.isArray(sx) ? sx : [sx])]} />;
  }

  const functionStrStartIdx = functionFullStr.indexOf("::") + 2;
  const functionStr = functionFullStr.substring(functionStrStartIdx);

  return (
    <CodeLine data={functionStr} sx={[...(Array.isArray(sx) ? sx : [sx])]} />
  );
}
