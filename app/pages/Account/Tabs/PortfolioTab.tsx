import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type * as React from "react";
import type {Types} from "~/types/aptos";
import {
  type DecibelPortfolio,
  type DecibelPosition,
  useDecibelPortfolio,
} from "../../../api/hooks/useDecibelPortfolio";
import {useGetDecibelMarketConfig} from "../../../api/hooks/useGetDecibelMarketName";
import HashButton, {HashType} from "../../../components/HashButton";
import {getFormattedBalanceStr} from "../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import GeneralTableCell from "../../../components/Table/GeneralTableCell";
import GeneralTableHeaderCell from "../../../components/Table/GeneralTableHeaderCell";
import GeneralTableRow from "../../../components/Table/GeneralTableRow";
import CoinsTab from "./CoinsTab";

const COLLATERAL_VALUE_DECIMALS = 6;

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon?: React.ReactNode;
  title: string;
  subtitle?: React.ReactNode;
}) {
  return (
    <Stack spacing={0.5} sx={{mb: 2}}>
      <Stack direction="row" spacing={1} sx={{alignItems: "center"}}>
        {icon}
        <Typography variant="h6">{title}</Typography>
      </Stack>
      {subtitle ? (
        <Typography variant="body2" sx={{color: "text.secondary"}}>
          {subtitle}
        </Typography>
      ) : null}
    </Stack>
  );
}

function MetricCard({
  label,
  value,
  tooltip,
}: {
  label: string;
  value: React.ReactNode;
  tooltip?: string;
}) {
  return (
    <Paper variant="outlined" sx={{p: 2, minWidth: 220}}>
      <Typography
        variant="caption"
        sx={{color: "text.secondary", textTransform: "uppercase"}}
        title={tooltip}
      >
        {label}
      </Typography>
      <Box sx={{mt: 0.5}}>{value}</Box>
    </Paper>
  );
}

function formatCollateralValue(raw: string | undefined): string {
  if (raw === undefined) return "—";
  return `$${getFormattedBalanceStr(raw, COLLATERAL_VALUE_DECIMALS)}`;
}

function DecibelPositionsTable({positions}: {positions: DecibelPosition[]}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (positions.length === 0) {
    return (
      <Typography variant="body2" sx={{color: "text.secondary"}}>
        No open positions.
      </Typography>
    );
  }

  if (isMobile) {
    return (
      <Stack spacing={1.5}>
        {positions.map((position) => (
          <PositionCard key={position.market} position={position} />
        ))}
      </Stack>
    );
  }

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <GeneralTableHeaderCell header="Market" />
          <GeneralTableHeaderCell header="Side" />
          <GeneralTableHeaderCell header="Size" />
          <GeneralTableHeaderCell header="Margin Mode" />
        </TableRow>
      </TableHead>
      <TableBody>
        {positions.map((position) => (
          <PositionRow key={position.market} position={position} />
        ))}
      </TableBody>
    </Table>
  );
}

function useMarketDisplay(market: string) {
  const {data: config} = useGetDecibelMarketConfig(market);
  return {
    name: config?.name,
    sizeDecimals: config?.szDecimals ?? 0,
    baseAsset: config?.baseAsset,
  };
}

function MarketCell({market}: {market: string}) {
  const {name} = useMarketDisplay(market);
  return (
    <Stack direction="row" spacing={1} sx={{alignItems: "center"}}>
      {name ? (
        <Typography variant="body2" sx={{fontWeight: 600}}>
          {name}
        </Typography>
      ) : null}
      <HashButton hash={market} type={HashType.OBJECT} size="small" />
    </Stack>
  );
}

function SizeCell({market, size}: {market: string; size: string | undefined}) {
  const {sizeDecimals, baseAsset} = useMarketDisplay(market);
  if (!size) {
    return (
      <Typography variant="body2" sx={{color: "text.secondary"}}>
        —
      </Typography>
    );
  }
  const formatted = getFormattedBalanceStr(size, sizeDecimals);
  return (
    <Typography variant="body2" sx={{fontFamily: "monospace"}}>
      {formatted}
      {baseAsset ? ` ${baseAsset}` : ""}
    </Typography>
  );
}

function SideChip({isLong}: {isLong: boolean | undefined}) {
  if (isLong === undefined) {
    return (
      <Typography variant="body2" sx={{color: "text.secondary"}}>
        —
      </Typography>
    );
  }
  return (
    <Chip
      icon={
        isLong ? (
          <ArrowUpwardIcon fontSize="small" />
        ) : (
          <ArrowDownwardIcon fontSize="small" />
        )
      }
      label={isLong ? "Long" : "Short"}
      size="small"
      color={isLong ? "success" : "error"}
      sx={{fontWeight: 600}}
    />
  );
}

function MarginModeChip({isolated}: {isolated: boolean | undefined}) {
  if (isolated === undefined) {
    return (
      <Typography variant="body2" sx={{color: "text.secondary"}}>
        —
      </Typography>
    );
  }
  return (
    <Chip
      label={isolated ? "Isolated" : "Cross"}
      size="small"
      variant="outlined"
    />
  );
}

function PositionRow({position}: {position: DecibelPosition}) {
  return (
    <GeneralTableRow>
      <GeneralTableCell>
        <MarketCell market={position.market} />
      </GeneralTableCell>
      <GeneralTableCell>
        <SideChip isLong={position.isLong} />
      </GeneralTableCell>
      <GeneralTableCell>
        <SizeCell market={position.market} size={position.size} />
      </GeneralTableCell>
      <GeneralTableCell>
        <MarginModeChip isolated={position.isolated} />
      </GeneralTableCell>
    </GeneralTableRow>
  );
}

function PositionCard({position}: {position: DecibelPosition}) {
  return (
    <Paper variant="outlined" sx={{p: 2}}>
      <Stack spacing={1}>
        <Stack direction="row" sx={{justifyContent: "space-between"}}>
          <MarketCell market={position.market} />
          <SideChip isLong={position.isLong} />
        </Stack>
        <Stack direction="row" spacing={1}>
          <Typography
            variant="caption"
            sx={{color: "text.secondary", minWidth: 80}}
          >
            Size
          </Typography>
          <SizeCell market={position.market} size={position.size} />
        </Stack>
        <Stack direction="row" spacing={1}>
          <Typography
            variant="caption"
            sx={{color: "text.secondary", minWidth: 80}}
          >
            Margin
          </Typography>
          <MarginModeChip isolated={position.isolated} />
        </Stack>
      </Stack>
    </Paper>
  );
}

function DecibelSection({
  address,
  portfolio,
  isLoading,
}: {
  address: string;
  portfolio: DecibelPortfolio;
  isLoading: boolean;
}) {
  const subaccount = portfolio.subaccount;
  const hasDecibelActivity =
    Boolean(subaccount) ||
    portfolio.netAssetValue !== undefined ||
    portfolio.crossCollateral !== undefined ||
    portfolio.positions.length > 0;

  if (!subaccount && !isLoading) {
    return (
      <Box>
        <SectionHeader
          title="Decibel"
          subtitle="Perpetual DEX deposits and open positions held under this account."
        />
        <Alert severity="info" variant="outlined">
          This account doesn’t have a Decibel subaccount on this network.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <SectionHeader
        title="Decibel"
        subtitle="Perpetual DEX deposits and open positions held under this account."
      />
      <Stack spacing={3}>
        {/* Header summary */}
        <Stack
          direction={{xs: "column", md: "row"}}
          spacing={2}
          sx={{flexWrap: "wrap"}}
        >
          <MetricCard
            label="Primary subaccount"
            value={
              subaccount ? (
                <HashButton
                  hash={subaccount}
                  type={HashType.ACCOUNT}
                  size="small"
                />
              ) : (
                <Typography variant="body2" sx={{color: "text.secondary"}}>
                  …
                </Typography>
              )
            }
            tooltip={`Owner: ${address}`}
          />
          <MetricCard
            label="Net asset value"
            value={
              <Typography variant="h6" sx={{fontFamily: "monospace"}}>
                {formatCollateralValue(portfolio.netAssetValue)}
              </Typography>
            }
            tooltip="perp_engine::get_account_net_asset_value"
          />
          <MetricCard
            label="Cross collateral"
            value={
              <Typography variant="h6" sx={{fontFamily: "monospace"}}>
                {formatCollateralValue(portfolio.crossCollateral)}
              </Typography>
            }
            tooltip="perp_engine::get_cross_total_collateral_value"
          />
        </Stack>

        {/* Subaccount collateral / FA balances */}
        {subaccount ? (
          <Box>
            <Typography variant="subtitle1" sx={{mb: 1, fontWeight: 600}}>
              Collateral balances
            </Typography>
            <CoinsTab address={subaccount} />
          </Box>
        ) : null}

        {/* Open positions */}
        <Box>
          <Typography variant="subtitle1" sx={{mb: 1, fontWeight: 600}}>
            Open positions
          </Typography>
          {isLoading && portfolio.positions.length === 0 ? (
            <Stack direction="row" spacing={1} sx={{alignItems: "center"}}>
              <CircularProgress size={16} />
              <Typography variant="body2" sx={{color: "text.secondary"}}>
                Loading positions…
              </Typography>
            </Stack>
          ) : (
            <DecibelPositionsTable positions={portfolio.positions} />
          )}
        </Box>

        {!hasDecibelActivity && !isLoading ? <EmptyTabContent /> : null}
      </Stack>
    </Box>
  );
}

type PortfolioTabProps = {
  address: string;
  resourceData?: Types.MoveResource[] | undefined;
};

/**
 * Account → Portfolio tab. Shows held assets in the wallet plus, when the
 * account has a Decibel subaccount on the current network, the collateral and
 * open positions it has stored in Decibel.
 */
export default function PortfolioTab({
  address,
  resourceData,
}: PortfolioTabProps) {
  const portfolio = useDecibelPortfolio(address);

  return (
    <Stack spacing={5} sx={{mt: 1}}>
      <Box>
        <SectionHeader
          icon={<AccountBalanceWalletOutlinedIcon fontSize="small" />}
          title="Wallet assets"
          subtitle="Fungible assets and coins held directly by this account."
        />
        <CoinsTab address={address} resourceData={resourceData} />
      </Box>

      {portfolio.isSupportedNetwork && portfolio.data ? (
        <DecibelSection
          address={address}
          portfolio={portfolio.data}
          isLoading={portfolio.isLoading}
        />
      ) : null}
    </Stack>
  );
}
