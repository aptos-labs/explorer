import * as React from "react";
import {useState, useCallback} from "react";
import {
  Table,
  TableHead,
  TableRow,
  Box,
  Stack,
  Paper,
  Typography,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Divider,
} from "@mui/material";
import {Close as CloseIcon, ContentCopy} from "@mui/icons-material";
import GeneralTableRow from "../../../../components/Table/GeneralTableRow";
import GeneralTableHeaderCell from "../../../../components/Table/GeneralTableHeaderCell";
import {assertNever} from "../../../../utils";
import HashButton, {HashType} from "../../../../components/HashButton";
import {BalanceChange} from "../../utils";
import CurrencyValue, {
  getFormattedBalanceStr,
} from "../../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import {useTheme} from "@mui/material";
import {getSemanticColors} from "../../../../themes/colors/aptosBrandColors";
import {Types} from "aptos";
import GeneralTableBody from "../../../../components/Table/GeneralTableBody";
import GeneralTableCell from "../../../../components/Table/GeneralTableCell";
import {
  VerifiedCoinCell,
  VerifiedAsset,
} from "../../../../components/Table/VerifiedCell";
import {getLearnMoreTooltip} from "../../helpers";
import StyledTooltip from "../../../../components/StyledTooltip";
import {useGetFaMetadata} from "../../../../api/hooks/useGetFaMetadata";
import {isValidAccountAddress} from "../../../utils";
import IdenticonImg from "../../../../components/IdenticonImg";

type BalanceChangeCellProps = {
  balanceChange: BalanceChange;
  transaction: Types.UserTransaction;
};

function AddressCell({balanceChange}: BalanceChangeCellProps) {
  return (
    <GeneralTableCell>
      {balanceChange.address ? (
        <HashButton hash={balanceChange.address} type={HashType.ACCOUNT} />
      ) : null}
    </GeneralTableCell>
  );
}

function TypeCell({balanceChange}: BalanceChangeCellProps) {
  return (
    <GeneralTableCell
      sx={{
        textAlign: "left",
      }}
    >
      {balanceChange.type}
    </GeneralTableCell>
  );
}

function VerifiedCell({balanceChange}: BalanceChangeCellProps) {
  return VerifiedCoinCell({
    data: {
      id: balanceChange?.asset?.id,
      known: balanceChange.known,
      isBanned: balanceChange.isBanned,
      isInPanoraTokenList: balanceChange.isInPanoraTokenList,
      symbol: balanceChange?.asset?.symbol,
    },
  });
}

function TokenInfoCell({balanceChange}: BalanceChangeCellProps) {
  const assetId = balanceChange.asset.id;
  const isFa = isValidAccountAddress(assetId);

  const {data: metadata} = useGetFaMetadata(balanceChange.asset.id, {
    enabled: balanceChange.logoUrl === undefined && isFa,
  });

  return (
    <GeneralTableCell sx={{}}>
      <HashButton
        hash={balanceChange.asset.id}
        type={
          balanceChange?.asset?.id?.includes("::")
            ? HashType.COIN
            : HashType.FUNGIBLE_ASSET
        }
        size="large"
        img={balanceChange.logoUrl || metadata?.icon_uri}
      />
    </GeneralTableCell>
  );
}

function AmountCell({balanceChange}: BalanceChangeCellProps) {
  const theme = useTheme();
  const semanticColors = getSemanticColors(theme.palette.mode);
  const isNegative = balanceChange.amount < 0;
  const amount =
    balanceChange.amount < 0 ? -balanceChange.amount : balanceChange.amount;
  const [showCopied, setShowCopied] = React.useState(false);

  const handleCopy = async () => {
    const formattedValue = getFormattedBalanceStr(
      amount.toString(),
      balanceChange.asset.decimals,
    );
    await navigator.clipboard.writeText(
      `${isNegative ? "-" : ""}${formattedValue}`,
    );
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 1500);
  };

  return (
    <GeneralTableCell
      sx={{
        textAlign: "right",
        color: isNegative
          ? semanticColors.status.error
          : theme.palette.primary.main,
      }}
      onClick={handleCopy}
    >
      {isNegative ? "-" : "+"}
      <CurrencyValue
        amount={amount.toString()}
        currencyCode={balanceChange.asset.symbol}
        decimals={balanceChange.asset.decimals}
      />{" "}
      <StyledTooltip open={showCopied} title="Copied!" placement="top">
        <ContentCopy style={{height: "1rem", width: "1.25rem"}} />
      </StyledTooltip>
    </GeneralTableCell>
  );
}

const BalanceChangeCells = Object.freeze({
  address: AddressCell,
  type: TypeCell,
  tokenInfo: TokenInfoCell,
  verified: VerifiedCell,
  amount: AmountCell,
});

// Modal component for displaying full balance change details
type BalanceChangeDetailsModalProps = {
  open: boolean;
  onClose: () => void;
  balanceChange: BalanceChange | null;
  transaction: Types.UserTransaction;
};

function BalanceChangeDetailsModal({
  open,
  onClose,
  balanceChange,
  transaction: _transaction,
}: BalanceChangeDetailsModalProps) {
  const theme = useTheme();
  const semanticColors = getSemanticColors(theme.palette.mode);

  if (!balanceChange) return null;

  const isNegative = balanceChange.amount < 0;
  const amount =
    balanceChange.amount < 0 ? -balanceChange.amount : balanceChange.amount;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper,
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
        <Typography variant="h6" fontWeight={600}>
          Balance Change Details
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{color: theme.palette.text.secondary}}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{pt: 2}}>
        <Stack spacing={2.5}>
          {/* Account */}
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{mb: 0.5, display: "block"}}
            >
              Account
            </Typography>
            {balanceChange.address && (
              <HashButton
                hash={balanceChange.address}
                type={HashType.ACCOUNT}
                size="large"
              />
            )}
          </Box>

          {/* Event Type */}
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{mb: 0.5, display: "block"}}
            >
              Event Type
            </Typography>
            <Typography variant="body2">{balanceChange.type}</Typography>
          </Box>

          {/* Asset */}
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{mb: 0.5, display: "block"}}
            >
              Asset
            </Typography>
            <HashButton
              hash={balanceChange.asset.id}
              type={
                balanceChange?.asset?.id?.includes("::")
                  ? HashType.COIN
                  : HashType.FUNGIBLE_ASSET
              }
              size="large"
              img={balanceChange.logoUrl}
            />
          </Box>

          {/* Verification Status */}
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{mb: 0.5, display: "block"}}
            >
              Verification Status
            </Typography>
            <VerifiedAsset
              data={{
                id: balanceChange?.asset?.id,
                known: balanceChange.known,
                isBanned: balanceChange.isBanned,
                isInPanoraTokenList: balanceChange.isInPanoraTokenList,
                symbol: balanceChange?.asset?.symbol,
                banner: true,
              }}
            />
          </Box>

          {/* Amount */}
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{mb: 0.5, display: "block"}}
            >
              Change Amount
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
                color: isNegative
                  ? semanticColors.status.error
                  : theme.palette.primary.main,
              }}
            >
              {isNegative ? "-" : "+"}
              <CurrencyValue
                amount={amount.toString()}
                currencyCode={balanceChange.asset.symbol}
                decimals={balanceChange.asset.decimals}
              />
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

// Mobile card component for balance changes
type BalanceChangeCardProps = {
  balanceChange: BalanceChange;
  transaction: Types.UserTransaction;
  onClick: () => void;
};

function BalanceChangeCard({
  balanceChange,
  transaction: _transaction,
  onClick,
}: BalanceChangeCardProps) {
  const theme = useTheme();
  const semanticColors = getSemanticColors(theme.palette.mode);

  const isNegative = balanceChange.amount < 0;
  const amount =
    balanceChange.amount < 0 ? -balanceChange.amount : balanceChange.amount;

  const assetId = balanceChange.asset.id;
  const isFa = isValidAccountAddress(assetId);

  const {data: metadata} = useGetFaMetadata(balanceChange.asset.id, {
    enabled: balanceChange.logoUrl === undefined && isFa,
  });

  const logoUrl = balanceChange.logoUrl || metadata?.icon_uri;

  return (
    <Paper
      onClick={onClick}
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
      {/* Row 1: Type badge and Amount */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{mb: 0.75}}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography
            variant="caption"
            sx={{
              px: 1,
              py: 0.25,
              borderRadius: 1,
              backgroundColor:
                theme.palette.mode === "dark"
                  ? theme.palette.neutralShade.lighter
                  : theme.palette.neutralShade.darker,
              fontWeight: 500,
            }}
          >
            {balanceChange.type}
          </Typography>
        </Stack>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: isNegative
              ? semanticColors.status.error
              : theme.palette.primary.main,
          }}
        >
          {isNegative ? "-" : "+"}
          <CurrencyValue
            amount={amount.toString()}
            currencyCode={balanceChange.asset.symbol}
            decimals={balanceChange.asset.decimals}
          />
        </Typography>
      </Stack>

      {/* Row 2: Account address and Asset with icon */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{mt: 0.5}}
      >
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            mr: 2,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{display: "block", mb: 0.25}}
          >
            Account
          </Typography>
          <Stack direction="row" spacing={0.75} alignItems="center">
            {balanceChange.address && (
              <Box sx={{flexShrink: 0, width: 20, height: 20}}>
                <IdenticonImg address={balanceChange.address} />
              </Box>
            )}
            <Typography
              variant="body2"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                color: theme.palette.primary.main,
              }}
            >
              {balanceChange.address
                ? `${balanceChange.address.slice(0, 8)}...${balanceChange.address.slice(-6)}`
                : "-"}
            </Typography>
          </Stack>
        </Box>
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          sx={{flexShrink: 0}}
        >
          {logoUrl && (
            <img
              src={logoUrl}
              alt=""
              style={{width: 16, height: 16, borderRadius: 4}}
            />
          )}
          <Typography variant="caption" color="text.secondary">
            {balanceChange.asset.symbol || "Unknown"}
          </Typography>
          <VerifiedAsset
            data={{
              id: balanceChange?.asset?.id,
              known: balanceChange.known,
              isBanned: balanceChange.isBanned,
              isInPanoraTokenList: balanceChange.isInPanoraTokenList,
              symbol: balanceChange?.asset?.symbol,
            }}
          />
        </Stack>
      </Stack>
    </Paper>
  );
}

type Column = keyof typeof BalanceChangeCells;

const DEFAULT_COLUMNS: Column[] = [
  "address",
  "type",
  "tokenInfo",
  "verified",
  "amount",
];

type BalanceChangeRowProps = {
  balanceChange: BalanceChange;
  transaction: Types.UserTransaction;
  columns: Column[];
};

function BalanceChangeRow({
  balanceChange,
  transaction,
  columns,
}: BalanceChangeRowProps) {
  return (
    <GeneralTableRow>
      {columns.map((column) => {
        const Cell = BalanceChangeCells[column];
        return (
          <Cell
            key={column}
            balanceChange={balanceChange}
            transaction={transaction}
          />
        );
      })}
    </GeneralTableRow>
  );
}

type BalanceChangeHeaderCellProps = {
  column: Column;
};

function BalanceChangeHeaderCell({column}: BalanceChangeHeaderCellProps) {
  switch (column) {
    case "address":
      return <GeneralTableHeaderCell header="Account" />;
    case "type":
      return <GeneralTableHeaderCell header="Event Type" />;
    case "tokenInfo":
      return <GeneralTableHeaderCell header="Asset" />;
    case "verified":
      return (
        <GeneralTableHeaderCell
          header="Verified"
          tooltip={getLearnMoreTooltip("coin_verification")}
          isTableTooltip={true}
        />
      );
    case "amount":
      return <GeneralTableHeaderCell header="Change" textAlignRight={true} />;
    default:
      return assertNever(column);
  }
}

type CoinBalanceChangeTableProps = {
  balanceChanges: BalanceChange[];
  transaction: Types.UserTransaction;
  columns?: Column[];
};

export function CoinBalanceChangeTable({
  balanceChanges,
  transaction,
  columns = DEFAULT_COLUMNS,
}: CoinBalanceChangeTableProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [selectedBalanceChange, setSelectedBalanceChange] =
    useState<BalanceChange | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleCardClick = useCallback((balanceChange: BalanceChange) => {
    setSelectedBalanceChange(balanceChange);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setSelectedBalanceChange(null);
  }, []);

  // Mobile card view
  if (isMobile) {
    return (
      <>
        <Box sx={{maxHeight: "800px", overflow: "auto"}}>
          {balanceChanges.map((balanceChange, i) => (
            <BalanceChangeCard
              key={i}
              balanceChange={balanceChange}
              transaction={transaction}
              onClick={() => handleCardClick(balanceChange)}
            />
          ))}
        </Box>
        <BalanceChangeDetailsModal
          open={modalOpen}
          onClose={handleCloseModal}
          balanceChange={selectedBalanceChange}
          transaction={transaction}
        />
      </>
    );
  }

  // Desktop table view
  return (
    <Table>
      <TableHead>
        <TableRow>
          {columns.map((column) => (
            <BalanceChangeHeaderCell key={column} column={column} />
          ))}
        </TableRow>
      </TableHead>
      <GeneralTableBody>
        {balanceChanges.map((balanceChange, i) => {
          return (
            <BalanceChangeRow
              key={i}
              balanceChange={balanceChange}
              transaction={transaction}
              columns={columns}
            />
          );
        })}
      </GeneralTableBody>
    </Table>
  );
}
