import {Box, Stack, SxProps, Theme} from "@mui/material";
import CurrencyExchangeOutlinedIcon from "@mui/icons-material/CurrencyExchangeOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import {CodeLineBox} from "../../../../components/CodeLineBox";
import {Link} from "../../../../routing";
import {codeBlockColorClickableOnHover} from "../../../../themes/colors/aptosColorPalette";
import {User_Transaction} from "../../../../gql/graphql";

function CoinTransferCodeLine({
  sx,
  address,
  functionName,
  moduleName,
}: {
  sx?: SxProps<Theme>;
  address: string;
  moduleName: string;
  functionName: string;
}): JSX.Element {
  return (
    <CodeLineBox clickable sx={[...(Array.isArray(sx) ? sx : [sx])]}>
      <Link
        to={`/account/${address}/modules/code/${moduleName}/${functionName}`}
        underline="none"
        style={{color: "inherit"}}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <CurrencyExchangeOutlinedIcon sx={{fontSize: 17, padding: 0}} />
          <Box>{`Coin Transfer`}</Box>
        </Stack>
      </Link>
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
  transaction: User_Transaction;
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

  const address = transaction.payload.function.module.address;
  const moduleName = transaction.payload.function.module.name;
  const functionName = transaction.payload.function.name;
  const functionFullStr = `${address}::${moduleName}::${functionName}`;

  if (
    functionFullStr === "0x1::coin::transfer" ||
    functionFullStr === "0x1::aptos_account::transfer"
  ) {
    return (
      <CoinTransferCodeLine
        address={address}
        moduleName={moduleName}
        functionName={functionName}
        sx={[
          ...(Array.isArray(sx) ? sx : [sx]),
          {
            "&:hover": {
              backgroundColor: codeBlockColorClickableOnHover,
            },
          },
        ]}
      />
    );
  }

  return (
    <CodeLineBox clickable sx={[...(Array.isArray(sx) ? sx : [sx])]}>
      <Link
        to={`/account/${address}/modules/code/${moduleName}/${functionName}`}
        underline="none"
        style={{color: "inherit"}}
      >
        {moduleName + "::" + functionName}
      </Link>
    </CodeLineBox>
  );
}
