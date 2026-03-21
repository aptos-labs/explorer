import {Box, Chip, Skeleton, Stack, Typography, useTheme} from "@mui/material";
import type {Types} from "~/types/aptos";

type DecibelNetworkStatusProps = {
  ledgerInfo: Types.IndexResponse | undefined;
  isLoading: boolean;
};

function StatusItem({label, value}: {label: string; value: React.ReactNode}) {
  const theme = useTheme();
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Typography
        variant="body2"
        sx={{color: theme.palette.text.secondary, fontWeight: 500}}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{fontWeight: 600, fontFamily: "monospace"}}
      >
        {value}
      </Typography>
    </Stack>
  );
}

export default function DecibelNetworkStatus({
  ledgerInfo,
  isLoading,
}: DecibelNetworkStatusProps) {
  const theme = useTheme();

  if (isLoading) {
    return (
      <Box
        sx={{
          p: 2.5,
          mb: 2,
          borderRadius: `${theme.shape.borderRadius}px`,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Stack
          direction="row"
          spacing={3}
          flexWrap="wrap"
          rowGap={1}
          alignItems="center"
        >
          <Skeleton width={120} height={24} />
          <Skeleton width={160} height={24} />
          <Skeleton width={100} height={24} />
          <Skeleton width={140} height={24} />
        </Stack>
      </Box>
    );
  }

  if (!ledgerInfo) return null;

  return (
    <Box
      sx={{
        p: 2.5,
        mb: 2,
        borderRadius: `${theme.shape.borderRadius}px`,
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <Stack
        direction="row"
        spacing={3}
        flexWrap="wrap"
        rowGap={1}
        alignItems="center"
      >
        <Chip
          label="Decibel Network"
          size="small"
          color="primary"
          variant="outlined"
          sx={{fontWeight: 600}}
        />
        <StatusItem label="Chain ID:" value={ledgerInfo.chain_id} />
        <StatusItem
          label="Epoch:"
          value={Number(ledgerInfo.epoch).toLocaleString()}
        />
        <StatusItem
          label="Ledger Version:"
          value={Number(ledgerInfo.ledger_version).toLocaleString()}
        />
        <StatusItem
          label="Block Height:"
          value={Number(ledgerInfo.block_height).toLocaleString()}
        />
      </Stack>
    </Box>
  );
}
