import * as React from "react";
import {useMemo, useCallback, useState} from "react";
import {
  Box,
  Button,
  Stack,
  Table,
  TableHead,
  TableRow,
  Typography,
  Paper,
  useMediaQuery,
  Skeleton,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import GeneralTableRow from "../../components/Table/GeneralTableRow";
import GeneralTableHeaderCell from "../../components/Table/GeneralTableHeaderCell";
import HashButton, {HashType} from "../../components/HashButton";
import {useTheme} from "@mui/material";
import GeneralTableBody from "../../components/Table/GeneralTableBody";
import GeneralTableCell from "../../components/Table/GeneralTableCell";
import VirtualizedTableBody from "../../components/Table/VirtualizedTableBody";
import {CoinDescription} from "../../api/hooks/useGetCoinList";
import {
  VerifiedCoinCell,
  verifiedLevel,
  VerifiedType,
  getVerifiedMessageAndIcon,
} from "../../components/Table/VerifiedCell";
import {getAssetSymbol} from "../../utils";
import {getLearnMoreTooltip} from "../Transaction/helpers";
import {useNetworkName} from "../../global-config/GlobalConfig";
import {Network} from "@aptos-labs/ts-sdk";
import {useGetInMainnet} from "../../api/hooks/useGetInMainnet";
import {useNavigate, useAugmentToWithGlobalSearchParams} from "../../routing";

enum CoinVerificationFilterType {
  VERIFIED,
  RECOGNIZED,
  ALL,
}

// Helper to format price
function formatPrice(price: string | null | undefined): string {
  if (price === null || price === undefined) {
    return "—";
  }
  const numPrice = parseFloat(price);
  if (isNaN(numPrice)) {
    return "—";
  }
  if (numPrice < 0.0001) {
    return `$${numPrice.toExponential(2)}`;
  }
  if (numPrice < 1) {
    return `$${numPrice.toFixed(6)}`;
  }
  return `$${numPrice.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Mobile card component for coins
function CoinCard({
  coin,
  networkName,
}: {
  coin: CoinDescription;
  networkName: string;
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const augmentTo = useAugmentToWithGlobalSearchParams();
  const inMainnet = useGetInMainnet();

  const assetId = coin.tokenAddress ?? coin.faAddress;
  const isFA = coin.faAddress && !coin.tokenAddress;
  const linkTo = isFA ? `/fungible_asset/${assetId}` : `/coin/${assetId}`;

  const symbol = getAssetSymbol(coin.panoraSymbol, coin.bridge, coin.symbol);

  const verification = verifiedLevel(
    {
      id: assetId ?? "Unknown",
      known: coin.chainId !== 0,
      isBanned: coin.isBanned,
      isInPanoraTokenList: coin.isInPanoraTokenList,
      symbol: coin?.panoraSymbol ?? coin.symbol,
    },
    networkName,
  );

  const handleClick = () => {
    if (assetId) {
      navigate({to: augmentTo(linkTo)});
    }
  };

  return (
    <Paper
      onClick={handleClick}
      sx={{
        px: 2,
        py: 1.5,
        mb: 1,
        cursor: "pointer",
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        "&:hover": {
          filter:
            theme.palette.mode === "dark"
              ? "brightness(0.9)"
              : "brightness(0.99)",
        },
        "&:active": {
          background: theme.palette.neutralShade.main,
          transform: "translate(0,0.1rem)",
        },
      }}
    >
      {/* Row 1: Logo, Name, Symbol, Verified badge */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{mb: 0.75}}
      >
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{flex: 1, minWidth: 0}}
        >
          {coin.logoUrl && (
            <Box
              component="img"
              src={coin.logoUrl}
              alt={coin.symbol}
              sx={{width: 28, height: 28, borderRadius: "50%", flexShrink: 0}}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <Box sx={{minWidth: 0, flex: 1}}>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "0.9rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {coin.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{color: "text.secondary", fontSize: "0.75rem"}}
            >
              {symbol}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              backgroundColor: theme.palette.action.hover,
              px: 0.75,
              py: 0.25,
              borderRadius: 1,
              fontSize: "0.7rem",
            }}
          >
            {isFA ? "FA" : "Coin"}
          </Typography>
          {getVerifiedMessageAndIcon(verification.level).icon}
        </Stack>
      </Stack>

      {/* Row 2: Price */}
      {inMainnet && coin.usdPrice && (
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography sx={{fontSize: "0.85rem", color: "text.secondary"}}>
            Price
          </Typography>
          <Typography sx={{fontSize: "0.85rem", fontWeight: 500}}>
            {formatPrice(coin.usdPrice)}
          </Typography>
        </Stack>
      )}
    </Paper>
  );
}

// Table cell components
const CoinLogoCell = React.memo(function CoinLogoCell({
  coin,
}: {
  coin: CoinDescription;
}) {
  const assetId = coin.tokenAddress ?? coin.faAddress;
  const isFA = coin.faAddress && !coin.tokenAddress;

  function getType() {
    if (isFA) {
      return HashType.FUNGIBLE_ASSET;
    }
    return HashType.COIN;
  }

  return (
    <GeneralTableCell sx={{width: 400}}>
      <HashButton
        hash={assetId ?? "Unknown"}
        type={getType()}
        size="large"
        img={coin.logoUrl ? coin.logoUrl : coin.symbol}
      />
    </GeneralTableCell>
  );
});

const CoinNameCell = React.memo(function CoinNameCell({
  name,
  symbol,
}: {
  name: string;
  symbol: string;
}) {
  const theme = useTheme();
  return (
    <GeneralTableCell
      sx={{
        textAlign: "left",
        maxWidth: 200,
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      <Stack>
        <Typography
          sx={{
            fontWeight: 500,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </Typography>
        <Typography
          variant="caption"
          sx={{color: theme.palette.text.secondary}}
        >
          {symbol}
        </Typography>
      </Stack>
    </GeneralTableCell>
  );
});

const CoinTypeCell = React.memo(function CoinTypeCell({
  coin,
}: {
  coin: CoinDescription;
}) {
  const theme = useTheme();
  const isFA = coin.faAddress && !coin.tokenAddress;

  return (
    <GeneralTableCell>
      <Typography
        variant="caption"
        sx={{
          backgroundColor: theme.palette.action.hover,
          px: 1,
          py: 0.5,
          borderRadius: 1,
          fontSize: "0.75rem",
        }}
      >
        {isFA ? "Fungible Asset" : "Coin"}
      </Typography>
    </GeneralTableCell>
  );
});

const CoinVerifiedCell = React.memo(function CoinVerifiedCell({
  coin,
}: {
  coin: CoinDescription;
}) {
  return VerifiedCoinCell({
    data: {
      id: coin.tokenAddress ?? coin.faAddress ?? "Unknown",
      known: coin.chainId !== 0,
      isBanned: coin.isBanned,
      isInPanoraTokenList: coin.isInPanoraTokenList,
      symbol: coin?.panoraSymbol ?? coin.symbol,
    },
  });
});

const PriceCell = React.memo(function PriceCell({
  price,
}: {
  price: string | null;
}) {
  const inMainnet = useGetInMainnet();

  if (!inMainnet) {
    return <GeneralTableCell sx={{textAlign: "right"}}>—</GeneralTableCell>;
  }

  return (
    <GeneralTableCell sx={{textAlign: "right"}}>
      {formatPrice(price)}
    </GeneralTableCell>
  );
});

type CoinsListTableProps = {
  coins: CoinDescription[];
  isLoading: boolean;
};

export default function CoinsListTable({
  coins,
  isLoading,
}: CoinsListTableProps) {
  const theme = useTheme();
  const networkName = useNetworkName();
  const inMainnet = useGetInMainnet();
  const [verificationFilter, setVerificationFilter] = useState(
    CoinVerificationFilterType.VERIFIED,
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Set default filter based on network
  React.useEffect(() => {
    if (networkName !== Network.MAINNET) {
      setVerificationFilter(CoinVerificationFilterType.ALL);
    }
  }, [networkName]);

  const toIndex = useCallback((coin: CoinDescription): number => {
    return coin.panoraOrderIndex
      ? coin.panoraOrderIndex
      : coin.panoraIndex
        ? coin.panoraIndex
        : coin.chainId !== 0
          ? 0
          : 1000000;
  }, []);

  const getCoinId = useCallback((coin: CoinDescription): string | null => {
    return coin.tokenAddress ?? coin.faAddress;
  }, []);

  // Memoize coin verifications calculation
  const coinVerifications = useMemo<Record<string, VerifiedType>>(() => {
    const verifications: Record<string, VerifiedType> = {};
    coins.forEach((coin) => {
      const coinId = getCoinId(coin);
      if (coinId) {
        verifications[coinId] = verifiedLevel(
          {
            id: coin.tokenAddress ?? coin.faAddress ?? "Unknown",
            known: coin.chainId !== 0,
            isBanned: coin.isBanned,
            isInPanoraTokenList: coin.isInPanoraTokenList,
            symbol: coin?.panoraSymbol ?? coin.symbol,
          },
          networkName,
        ).level;
      }
    });
    return verifications;
  }, [coins, getCoinId, networkName]);

  // Filter and search logic
  const filteredCoins = useMemo(() => {
    let filtered = coins;

    // Apply verification filter
    switch (verificationFilter) {
      case CoinVerificationFilterType.VERIFIED:
        filtered = filtered.filter((coin) => {
          const coinId = getCoinId(coin);
          if (coinId && coinVerifications[coinId]) {
            const level = coinVerifications[coinId];
            return (
              level === VerifiedType.LABS_VERIFIED ||
              level === VerifiedType.COMMUNITY_VERIFIED ||
              level === VerifiedType.NATIVE_TOKEN
            );
          }
          return false;
        });
        break;
      case CoinVerificationFilterType.RECOGNIZED:
        filtered = filtered.filter((coin) => {
          const coinId = getCoinId(coin);
          if (coinId && coinVerifications[coinId]) {
            const level = coinVerifications[coinId];
            return (
              level === VerifiedType.LABS_VERIFIED ||
              level === VerifiedType.COMMUNITY_VERIFIED ||
              level === VerifiedType.NATIVE_TOKEN ||
              level === VerifiedType.RECOGNIZED
            );
          }
          return false;
        });
        break;
      case CoinVerificationFilterType.ALL:
      default:
        break;
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((coin) => {
        const name = coin.name?.toLowerCase() || "";
        const symbol = coin.symbol?.toLowerCase() || "";
        const panoraSymbol = coin.panoraSymbol?.toLowerCase() || "";
        const tokenAddress = coin.tokenAddress?.toLowerCase() || "";
        const faAddress = coin.faAddress?.toLowerCase() || "";

        return (
          name.includes(query) ||
          symbol.includes(query) ||
          panoraSymbol.includes(query) ||
          tokenAddress.includes(query) ||
          faAddress.includes(query)
        );
      });
    }

    // Sort by panora index
    return filtered.sort((a, b) => toIndex(a) - toIndex(b));
  }, [
    coins,
    verificationFilter,
    searchQuery,
    coinVerifications,
    getCoinId,
    toIndex,
  ]);

  const selectedTextColor = theme.palette.primary.main;
  const unselectedTextColor = theme.palette.text.secondary;
  const dividerTextColor =
    theme.palette.mode === "dark"
      ? theme.palette.neutralShade.lighter
      : theme.palette.neutralShade.darker;

  const filterSelector = (
    <Stack
      direction="row"
      justifyContent="flex-end"
      spacing={1}
      marginY={0.5}
      height={16}
    >
      <Button
        variant="text"
        onClick={() =>
          setVerificationFilter(CoinVerificationFilterType.VERIFIED)
        }
        sx={{
          fontSize: 12,
          fontWeight: 600,
          color:
            CoinVerificationFilterType.VERIFIED === verificationFilter
              ? selectedTextColor
              : unselectedTextColor,
          padding: 0,
          "&:hover": {
            background: "transparent",
          },
        }}
      >
        Verified
      </Button>
      <Typography
        variant="subtitle1"
        sx={{
          fontSize: 11,
          fontWeight: 600,
          color: dividerTextColor,
        }}
      >
        |
      </Typography>
      <Button
        variant="text"
        onClick={() =>
          setVerificationFilter(CoinVerificationFilterType.RECOGNIZED)
        }
        sx={{
          fontSize: 12,
          fontWeight: 600,
          color:
            CoinVerificationFilterType.RECOGNIZED === verificationFilter
              ? selectedTextColor
              : unselectedTextColor,
          padding: 0,
          "&:hover": {
            background: "transparent",
          },
        }}
      >
        Recognized
      </Button>
      <Typography
        variant="subtitle1"
        sx={{
          fontSize: 11,
          fontWeight: 600,
          color: dividerTextColor,
        }}
      >
        |
      </Typography>
      <Button
        variant="text"
        onClick={() => setVerificationFilter(CoinVerificationFilterType.ALL)}
        sx={{
          fontSize: 12,
          fontWeight: 600,
          color:
            CoinVerificationFilterType.ALL === verificationFilter
              ? selectedTextColor
              : unselectedTextColor,
          padding: 0,
          "&:hover": {
            background: "transparent",
          },
        }}
      >
        All
      </Button>
    </Stack>
  );

  // Memoize coin rows for virtualization
  const coinRows = useMemo(() => {
    return filteredCoins.map((coin, i) => {
      const symbol = getAssetSymbol(
        coin.panoraSymbol,
        coin.bridge,
        coin.symbol,
      );
      return (
        <GeneralTableRow key={coin.tokenAddress ?? coin.faAddress ?? i}>
          <CoinLogoCell coin={coin} />
          <CoinNameCell name={coin.name} symbol={symbol} />
          <CoinTypeCell coin={coin} />
          <CoinVerifiedCell coin={coin} />
          <PriceCell price={coin.usdPrice} />
        </GeneralTableRow>
      );
    });
  }, [filteredCoins]);

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Loading skeleton
  if (isLoading) {
    return (
      <Box>
        {[...Array(10)].map((_, i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            height={60}
            sx={{mb: 1, borderRadius: 1}}
          />
        ))}
      </Box>
    );
  }

  // Mobile card view
  if (isMobile) {
    return (
      <>
        <Stack direction="column" spacing={2} sx={{mb: 2}}>
          <TextField
            size="small"
            placeholder="Search by name, symbol, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{color: "text.secondary"}} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
          {filterSelector}
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
          {filteredCoins.length} coins found
        </Typography>
        <Box>
          {filteredCoins.length > 0 ? (
            filteredCoins.map((coin, i) => (
              <CoinCard
                key={coin.tokenAddress ?? coin.faAddress ?? i}
                coin={coin}
                networkName={networkName}
              />
            ))
          ) : (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{textAlign: "center", py: 3}}
            >
              No coins found
            </Typography>
          )}
        </Box>
      </>
    );
  }

  // Desktop table view
  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{mb: 2}}
      >
        <TextField
          size="small"
          placeholder="Search by name, symbol, or address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{color: "text.secondary"}} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: 350,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
        />
        {filterSelector}
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
        {filteredCoins.length} coins found
      </Typography>
      <Box sx={{overflowX: "auto"}}>
        <Table>
          <TableHead>
            <TableRow>
              <GeneralTableHeaderCell header="Asset" />
              <GeneralTableHeaderCell header="Name" />
              <GeneralTableHeaderCell header="Type" />
              <GeneralTableHeaderCell
                header="Status"
                tooltip={getLearnMoreTooltip("coin_verification")}
                isTableTooltip={true}
              />
              {inMainnet && (
                <GeneralTableHeaderCell header="Price" textAlignRight />
              )}
            </TableRow>
          </TableHead>
          {filteredCoins.length > 0 ? (
            <VirtualizedTableBody
              estimatedRowHeight={60}
              virtualizationThreshold={15}
            >
              {coinRows}
            </VirtualizedTableBody>
          ) : (
            <GeneralTableBody>
              <TableRow>
                <GeneralTableCell colSpan={5} sx={{textAlign: "center", py: 3}}>
                  <Typography variant="body1" color="text.secondary">
                    No coins found
                  </Typography>
                </GeneralTableCell>
              </TableRow>
            </GeneralTableBody>
          )}
        </Table>
      </Box>
    </>
  );
}
