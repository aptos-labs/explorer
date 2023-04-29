import React from "react";
import {Box, Stack, SxProps, Theme} from "@mui/material";
import {Types} from "aptos";
import CurrencyExchangeOutlinedIcon from "@mui/icons-material/CurrencyExchangeOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import {CodeLineBox} from "../../../../components/CodeLineBox";
import {Link} from "../../../../routing";
import {codeBlockColorClickableOnHover} from "../../../../themes/colors/aptosColorPalette";

function CoinTransferCodeLine({sx}: {sx?: SxProps<Theme>}): JSX.Element {
  return (
    <CodeLineBox clickable sx={[...(Array.isArray(sx) ? sx : [sx])]}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <CurrencyExchangeOutlinedIcon sx={{fontSize: 17, padding: 0}} />
        <Box>{`Coin Transfer`}</Box>
      </Stack>
    </CodeLineBox>
  );
}

function ScriptCodeLine({sx}: {sx?: SxProps<Theme>}): JSX.Element {
  return (
    <CodeLineBox sx={[...(Array.isArray(sx) ? sx : [sx])]}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <DescriptionOutlinedIcon sx={{fontSize: 17, padding: 0}} />
        <Box>{`Script`}</Box>
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
  if (!("payload" in transaction)) {
    return null;
  }

  if (transaction.payload.type === "script_payload") {
    return <ScriptCodeLine sx={[...(Array.isArray(sx) ? sx : [sx])]} />;
  }

  if (!("function" in transaction.payload)) {
    return null;
  }

  const functionFullStr = transaction.payload.function;
  const [address, moduleName, functionName] = functionFullStr.split("::");

  if (
    functionFullStr === "0x1::coin::transfer" ||
    functionFullStr === "0x1::aptos_account::transfer"
  ) {
    return (
      <Link
        to={`/account/${address}/modules/code/${moduleName}?entry_function=${functionName}`}
        underline="none"
      >
        <CoinTransferCodeLine
          sx={[
            ...(Array.isArray(sx) ? sx : [sx]),
            {
              "&:hover": {
                backgroundColor: codeBlockColorClickableOnHover,
              },
            },
          ]}
        />
      </Link>
    );
  }

  return (
    <CodeLineBox clickable sx={[...(Array.isArray(sx) ? sx : [sx])]}>
      <Link
        to={`/account/${address}/modules/code/${moduleName}?entry_function=${functionName}`}
        underline="none"
        style={{color: "inherit"}}
      >
        {moduleName + "::" + functionName}
      </Link>
    </CodeLineBox>
  );
}
