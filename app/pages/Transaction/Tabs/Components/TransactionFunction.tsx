import React from "react";
import {Box, Stack, SxProps, Theme, useTheme} from "@mui/material";
import {Types} from "aptos";
import CurrencyExchangeOutlinedIcon from "@mui/icons-material/CurrencyExchangeOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import {CodeLineBox} from "../../../../components/CodeLineBox";
import {Link} from "../../../../routing";
import {WaterDropOutlined} from "@mui/icons-material";
import {useNetworkName} from "../../../../global-config/GlobalConfig";
import {Network} from "@aptos-labs/ts-sdk";
import {getSemanticColors} from "../../../../themes/colors/aptosBrandColors";

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
}): React.JSX.Element {
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

function ScriptCodeLine({sx}: {sx?: SxProps<Theme>}): React.JSX.Element {
  return (
    <CodeLineBox sx={[...(Array.isArray(sx) ? sx : [sx])]}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <DescriptionOutlinedIcon sx={{fontSize: 17, padding: 0}} />
        <Box>{`Script`}</Box>
      </Stack>
    </CodeLineBox>
  );
}

function FaucetCodeLine({sx}: {sx?: SxProps<Theme>}): React.JSX.Element {
  return (
    <CodeLineBox sx={[...(Array.isArray(sx) ? sx : [sx])]}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <WaterDropOutlined sx={{fontSize: 17, padding: 0}} />
        <Box>{`Faucet`}</Box>
      </Stack>
    </CodeLineBox>
  );
}

const TESTNET_FAUCET_SCRIPT =
  "0xa11ceb0b0500000008010008020804030c150421020523100733500883012006a30114000000010002000301050800030403010002060105010001070002000008000200010403060c050301050001060c01080001030d6170746f735f6163636f756e740a6170746f735f636f696e04636f696e067369676e65720a616464726573735f6f66094170746f73436f696e0762616c616e6365046d696e74087472616e7366657200000000000000000000000000000000000000000000000000000000000000010308a0860100000000000308ffffffffffffffff000001170a0011000c030a03380007010a02170700172304120a000b030a0207001611020b000b010b02110302";
const DEVNET_FAUCET_SCRIPT =
  "0xa11ceb0b0600000008010008020804030c150421020523100733500883012006a30114000000010002000301050800030403010002060105010001070002000008000200010403060c050301050001060c01080001030d6170746f735f6163636f756e740a6170746f735f636f696e04636f696e067369676e65720a616464726573735f6f66094170746f73436f696e0762616c616e6365046d696e74087472616e7366657200000000000000000000000000000000000000000000000000000000000000010308a0860100000000000308ffffffffffffffff000001170a0011000c030a03380007010a02170700172304120a000b030a0207001611020b000b010b02110302";
export default function TransactionFunction({
  transaction,
  sx,
}: {
  transaction: Types.Transaction;
  sx?: SxProps<Theme>;
}) {
  const theme = useTheme();
  const semanticColors = getSemanticColors(theme.palette.mode);
  const networkName = useNetworkName();
  if (!("payload" in transaction)) {
    return null;
  }

  if (
    transaction.payload.type === "script_payload" &&
    "code" in transaction.payload &&
    "bytecode" in transaction.payload.code
  ) {
    if (
      networkName === Network.TESTNET &&
      transaction.payload.code.bytecode === TESTNET_FAUCET_SCRIPT
    ) {
      return <FaucetCodeLine sx={[...(Array.isArray(sx) ? sx : [sx])]} />;
    } else if (
      networkName === Network.DEVNET &&
      transaction.payload.code.bytecode === DEVNET_FAUCET_SCRIPT
    ) {
      return <FaucetCodeLine sx={[...(Array.isArray(sx) ? sx : [sx])]} />;
    }

    return <ScriptCodeLine sx={[...(Array.isArray(sx) ? sx : [sx])]} />;
  }

  let functionFullStr: string;
  if (transaction.payload.type === "multisig_payload") {
    if (
      "transaction_payload" in transaction.payload &&
      transaction.payload.transaction_payload &&
      "function" in transaction.payload.transaction_payload
    ) {
      functionFullStr = transaction.payload.transaction_payload.function;
    } else {
      // TODO: change this to something more useful for these multisig executions
      return "Multisig Transaction";
    }
  } else if ("function" in transaction.payload) {
    functionFullStr = transaction.payload.function;
  } else {
    return null;
  }

  const [address, moduleName, functionName] = functionFullStr.split("::");

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
              backgroundColor: semanticColors.codeBlock.backgroundHover,
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
