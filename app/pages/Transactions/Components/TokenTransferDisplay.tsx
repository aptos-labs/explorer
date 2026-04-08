import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import type * as React from "react";
import {createContext, useCallback, useContext, useMemo, useState} from "react";
import type {Types} from "~/types/aptos";
import {useGetCoinList} from "../../../api/hooks/useGetCoinList";
import CurrencyValue from "../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import {
  VerifiedType,
  verifiedLevel,
} from "../../../components/Table/VerifiedCell";
import {useNetworkName} from "../../../global-config/GlobalConfig";
import {getSemanticColors} from "../../../themes/colors/aptosBrandColors";
import {tryStandardizeAddress} from "../../../utils";
import {
  type BalanceChange,
  parseRawEventsForBalanceChanges,
} from "../../Transaction/utils";

export type AggregatedTokenTransfer = {
  asset: BalanceChange["asset"];
  amount: bigint;
  known: boolean;
  isBanned?: boolean;
  logoUrl?: string;
  isInPanoraTokenList?: boolean;
};

const APT_ASSET_IDS = new Set([
  "0x1::aptos_coin::AptosCoin",
  "0x000000000000000000000000000000000000000000000000000000000000000a",
  "0x000000000000000000000000000000000000000000000000000000000000000A",
]);

function isAPT(assetId: string): boolean {
  if (APT_ASSET_IDS.has(assetId)) return true;
  const standardized = tryStandardizeAddress(assetId);
  return standardized ? APT_ASSET_IDS.has(standardized) : false;
}

function isVerifiedToken(
  token: {
    asset: {id: string; symbol: string};
    known: boolean;
    isBanned?: boolean;
    isInPanoraTokenList?: boolean;
  },
  networkName: string,
): boolean {
  const {level} = verifiedLevel(
    {
      id: token.asset.id,
      known: token.known,
      isBanned: token.isBanned,
      isInPanoraTokenList: token.isInPanoraTokenList,
      symbol: token.asset.symbol,
    },
    networkName,
  );
  return (
    level === VerifiedType.NATIVE_TOKEN ||
    level === VerifiedType.LABS_VERIFIED ||
    level === VerifiedType.COMMUNITY_VERIFIED
  );
}

export function getVerifiedTokenTransfers(
  balanceChanges: BalanceChange[],
  networkName: string,
  address?: string,
): AggregatedTokenTransfer[] {
  const assetMap = new Map<string, AggregatedTokenTransfer>();

  if (address) {
    const standardizedAddress = tryStandardizeAddress(address);
    const addressChanges = balanceChanges.filter((bc) => {
      const bcAddr = tryStandardizeAddress(bc.address);
      return bcAddr === standardizedAddress;
    });
    for (const bc of addressChanges) {
      const key = bc.asset.id;
      const existing = assetMap.get(key);
      if (existing) {
        existing.amount += bc.amount;
      } else {
        assetMap.set(key, {
          asset: bc.asset,
          amount: bc.amount,
          known: bc.known,
          isBanned: bc.isBanned,
          logoUrl: bc.logoUrl,
          isInPanoraTokenList: bc.isInPanoraTokenList,
        });
      }
    }
  } else {
    for (const bc of balanceChanges) {
      if (bc.amount <= 0) continue;
      const key = bc.asset.id;
      const existing = assetMap.get(key);
      if (existing) {
        existing.amount += bc.amount;
      } else {
        assetMap.set(key, {
          asset: bc.asset,
          amount: bc.amount,
          known: bc.known,
          isBanned: bc.isBanned,
          logoUrl: bc.logoUrl,
          isInPanoraTokenList: bc.isInPanoraTokenList,
        });
      }
    }
  }

  const result = Array.from(assetMap.values())
    .filter((t) => t.amount !== BigInt(0))
    .filter((t) => isVerifiedToken(t, networkName));

  result.sort((a, b) => {
    const aIsAPT = isAPT(a.asset.id);
    const bIsAPT = isAPT(b.asset.id);
    if (aIsAPT && !bIsAPT) return -1;
    if (!aIsAPT && bIsAPT) return 1;
    const aAbs = a.amount < 0 ? -a.amount : a.amount;
    const bAbs = b.amount < 0 ? -b.amount : b.amount;
    if (aAbs > bAbs) return -1;
    if (aAbs < bAbs) return 1;
    return 0;
  });

  return result;
}

// --- Modal context for lifting state up to the table level ---

type TokenTransferModalData = {
  transfers: AggregatedTokenTransfer[];
  address?: string;
};

type TokenTransferModalContextValue = {
  showModal: (data: TokenTransferModalData) => void;
};

const TokenTransferModalContext =
  createContext<TokenTransferModalContextValue | null>(null);

export function TokenTransferModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [modalData, setModalData] = useState<TokenTransferModalData | null>(
    null,
  );

  const showModal = useCallback((data: TokenTransferModalData) => {
    setModalData(data);
  }, []);

  const handleClose = useCallback(() => {
    setModalData(null);
  }, []);

  const contextValue = useMemo(() => ({showModal}), [showModal]);

  return (
    <TokenTransferModalContext.Provider value={contextValue}>
      {children}
      {modalData && (
        <VerifiedTokensModal
          open={true}
          onClose={handleClose}
          transfers={modalData.transfers}
          address={modalData.address}
        />
      )}
    </TokenTransferModalContext.Provider>
  );
}

// --- Modal component ---

type VerifiedTokensModalProps = {
  open: boolean;
  onClose: () => void;
  transfers: AggregatedTokenTransfer[];
  address?: string;
};

function VerifiedTokensModal({
  open,
  onClose,
  transfers,
  address,
}: VerifiedTokensModalProps) {
  const theme = useTheme();
  const semanticColors = getSemanticColors(theme.palette.mode);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper,
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Typography variant="h6" sx={{fontWeight: 600}}>
          Token Transfers
        </Typography>
        <IconButton
          aria-label="Close"
          onClick={onClose}
          size="small"
          sx={{color: theme.palette.text.secondary}}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{pt: 2}}>
        <Stack spacing={1.5}>
          {transfers.map((transfer) => {
            const abs =
              transfer.amount < 0 ? -transfer.amount : transfer.amount;
            const isNegative = transfer.amount < 0;
            const isPositive = transfer.amount > 0;

            return (
              <Stack
                key={transfer.asset.id}
                direction="row"
                sx={{
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 1,
                  px: 1.5,
                  borderRadius: 1,
                  backgroundColor: theme.palette.background.default,
                }}
              >
                <Stack direction="row" spacing={1} sx={{alignItems: "center"}}>
                  {transfer.logoUrl && (
                    <img
                      src={transfer.logoUrl}
                      alt={transfer.asset.symbol}
                      style={{width: 24, height: 24, borderRadius: 12}}
                    />
                  )}
                  <Typography variant="body2" sx={{fontWeight: 500}}>
                    {transfer.asset.symbol}
                  </Typography>
                </Stack>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: address
                      ? isPositive
                        ? semanticColors.status.info
                        : isNegative
                          ? semanticColors.status.error
                          : undefined
                      : undefined,
                  }}
                >
                  {address && isPositive && "+"}
                  {address && isNegative && "-"}
                  <CurrencyValue
                    amount={abs.toString()}
                    decimals={transfer.asset.decimals}
                  />{" "}
                  {transfer.asset.symbol}
                </Typography>
              </Stack>
            );
          })}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

// --- Inline display component ---

type TokenTransferDisplayProps = {
  transaction: Types.Transaction;
  address?: string;
};

export default function TokenTransferDisplay({
  transaction,
  address,
}: TokenTransferDisplayProps) {
  const theme = useTheme();
  const networkName = useNetworkName();
  const {data: coinData} = useGetCoinList();
  const modalCtx = useContext(TokenTransferModalContext);
  const semanticColors = getSemanticColors(theme.palette.mode);

  const balanceChanges = useMemo(() => {
    if (!("events" in transaction)) return [];
    return parseRawEventsForBalanceChanges(transaction, coinData?.data);
  }, [transaction, coinData]);

  const verifiedTransfers = useMemo(
    () => getVerifiedTokenTransfers(balanceChanges, networkName, address),
    [balanceChanges, networkName, address],
  );

  if (verifiedTransfers.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        -
      </Typography>
    );
  }

  const primary = verifiedTransfers[0];
  const moreCount = verifiedTransfers.length - 1;
  const primaryAbs = primary.amount < 0 ? -primary.amount : primary.amount;

  const amountColor = address
    ? primary.amount > 0
      ? semanticColors.status.info
      : primary.amount < 0
        ? semanticColors.status.error
        : undefined
    : undefined;

  return (
    <Box sx={{color: amountColor}}>
      {address && primary.amount > 0 && <>+</>}
      {address && primary.amount < 0 && <>-</>}
      <CurrencyValue
        amount={primaryAbs.toString()}
        decimals={primary.asset.decimals}
        currencyCode={primary.asset.symbol}
      />
      {moreCount > 0 && (
        <Box
          component="button"
          type="button"
          onMouseDown={(e: React.MouseEvent) => {
            e.stopPropagation();
          }}
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            modalCtx?.showModal({transfers: verifiedTransfers, address});
          }}
          sx={{
            background: "none",
            border: "none",
            padding: "0 4px",
            font: "inherit",
            color: theme.palette.primary.main,
            cursor: "pointer",
            "&:hover": {textDecoration: "underline"},
            ml: 0.25,
            fontSize: "inherit",
            lineHeight: "inherit",
            verticalAlign: "baseline",
            display: "inline",
          }}
        >
          &amp; {moreCount} more
        </Box>
      )}
    </Box>
  );
}
