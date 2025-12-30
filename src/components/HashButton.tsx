import React, {useState} from "react";
import {
  Box,
  BoxProps,
  Button,
  Typography,
  Popover,
  IconButton,
  useTheme,
  Tooltip,
  Stack,
  alpha,
} from "@mui/material";
import {getSemanticColors} from "../themes/colors/aptosBrandColors";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import {
  isValidAccountAddress,
  truncate,
  truncateAddress,
  truncateAddressMiddle,
} from "../pages/utils";
import {assertNever, standardizeAddress} from "../utils";
import {useGetNameFromAddress} from "../api/hooks/useGetANS";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import IdenticonImg from "./IdenticonImg";
import {Link} from "../routing";
import {useGetCoinList, CoinDescription} from "../api/hooks/useGetCoinList";

export enum HashType {
  ACCOUNT = "account",
  TRANSACTION = "transaction",
  OBJECT = "object",
  COIN = "coin",
  FUNGIBLE_ASSET = "fungible_asset",
  OTHERS = "others",
}

function getHashLinkStr(input: string, type: HashType): string {
  switch (type) {
    case HashType.ACCOUNT:
      return `/account/${input}`;
    case HashType.TRANSACTION:
      return `/txn/${input}`;
    case HashType.OBJECT:
      return `/object/${input}`;
    case HashType.COIN:
      return `/coin/${input}`;
    case HashType.FUNGIBLE_ASSET:
      return `/fungible_asset/${input}`;
    case HashType.OTHERS:
      return "";
    default:
      return assertNever(type);
  }
}

function HashLink(hash: string, type: HashType) {
  switch (type) {
    case HashType.ACCOUNT:
    case HashType.TRANSACTION:
    case HashType.OBJECT:
    case HashType.COIN:
    case HashType.FUNGIBLE_ASSET:
      return (
        <Link to={getHashLinkStr(hash, type)} color="inherit">
          {hash}
        </Link>
      );
    case HashType.OTHERS:
      return <>{hash}</>;
    default:
      return assertNever(type);
  }
}

interface HashButtonProps extends BoxProps {
  hash: string;
  type: HashType;
  size?: "small" | "large";
  isValidator?: boolean;
  img?: string;
}

interface AccountHashButtonInnerProps extends BoxProps {
  hash: string;
  type: HashType;
  size?: "small" | "large";
  isValidator: boolean;
}

function AccountHashButtonInner({
  hash,
  type,
  size = "small",
  isValidator,
}: AccountHashButtonInnerProps) {
  // Standardize address
  const address = standardizeAddress(hash);

  const name = useGetNameFromAddress(address, false, isValidator);
  const truncateHash =
    size === "large"
      ? truncateAddressMiddle(address)
      : truncateAddress(address);
  const [copyTooltipOpen, setCopyTooltipOpen] = useState(false);
  const theme = useTheme();
  const semanticColors = getSemanticColors(theme.palette.mode);
  const copyAddress = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await navigator.clipboard.writeText(address);
    setCopyTooltipOpen(true);
    setTimeout(() => {
      setCopyTooltipOpen(false);
    }, 2000);
  };

  return (
    <Stack direction="row" alignItems={"center"} spacing={1}>
      <IdenticonImg address={address} />
      <Link
        to={getHashLinkStr(address, type)}
        sx={{
          backgroundColor: semanticColors.codeBlock.background,
          "&:hover": {
            backgroundColor: semanticColors.codeBlock.backgroundHover,
          },
          color: theme.palette.primary.main,
          padding: "0.15rem 0.35rem 0.15rem 1rem",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          borderRadius: 50,
          textDecoration: "none",
        }}
      >
        <Tooltip title={name ?? address} enterDelay={500} enterNextDelay={500}>
          <span>{name ? truncate(name, 9, 11, "…") : truncateHash}</span>
        </Tooltip>
        <Tooltip title="Copied" open={copyTooltipOpen}>
          <Button
            sx={{
              color: "inherit",
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
              },
              padding: "0.25rem 0.5rem 0.25rem 0.5rem",
              margin: "0 0 0 0.2rem",
              minWidth: "unset", // remove minimum width
              borderRadius: 50,
            }}
            onClick={copyAddress}
            endIcon={
              <ContentCopyIcon sx={{opacity: "0.75", mr: 1}} fontSize="small" />
            }
            size="small"
          />
        </Tooltip>
      </Link>
    </Stack>
  );
}

interface HashButtonInnerProps extends BoxProps {
  label?: string;
  hash: string;
  type: HashType;
  size?: "small" | "large";
  img?: string;
}

function HashButtonInner({
  label,
  hash,
  type,
  size = "small",
  img,
  ...props
}: HashButtonInnerProps) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const hashExpand = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const hashCollapse = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  // Check if img is an emoji (including variation selectors like \uFE0F)
  // The regex matches one or more emoji characters, with optional variation selectors
  const imgIsEmoji = img && /^\p{Emoji}[\p{Emoji}\uFE0F]*$/u.test(img);

  const truncateHash =
    size === "large" ? truncateAddressMiddle(hash) : truncateAddress(hash);

  let icon = null;
  if (img && imgIsEmoji) {
    icon = (
      <Box component="span" sx={{mr: 1, display: "flex", alignItems: "center"}}>
        {img}
      </Box>
    );
  } else if (img) {
    icon = (
      <Box component="span" sx={{mr: 1, display: "flex", alignItems: "center"}}>
        <img src={img} alt={img} height={20} width={20} />
      </Box>
    );
  }

  return (
    <Box {...props}>
      <Button
        sx={{
          textTransform: "none",
          backgroundColor:
            theme.palette.mode === "dark"
              ? theme.palette.neutralShade.lighter
              : theme.palette.neutralShade.darker,
          display: "flex",
          borderRadius: 1,
          color: "inherit",
          padding: "0.15rem 0.5rem 0.15rem 1rem",
          "&:hover": {
            backgroundColor:
              theme.palette.mode === "dark"
                ? theme.palette.neutralShade.main
                : theme.palette.neutralShade.main,
          },
          minWidth: 141,
        }}
        aria-describedby={id}
        onClick={hashExpand}
        variant="contained"
        endIcon={<ChevronRightRoundedIcon sx={{opacity: "0.75", m: 0}} />}
      >
        {icon}
        {label ? label : truncateHash}
      </Button>

      <Popover
        onClick={(e) => {
          e.stopPropagation();
        }}
        sx={{
          overflow: "scroll",
          ".MuiPaper-root": {boxShadow: "none"},
          "&.MuiModal-root .MuiBackdrop-root": {
            transition: "none!important",
            backgroundColor: alpha(theme.palette.background.default, 0.5),
          },
        }}
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={hashCollapse}
        anchorOrigin={{
          vertical: "center",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "center",
          horizontal: "left",
        }}
      >
        <Typography
          sx={{
            display: "flex",
            alignItems: "center",
            backgroundColor:
              theme.palette.mode === "dark"
                ? theme.palette.neutralShade.lighter
                : theme.palette.neutralShade.darker,
            px: 2,
            py: "0.15rem",
            fontSize: "14px",
            overflow: "scroll",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": {
              display: "none",
            },
          }}
        >
          {HashLink(hash, type)}
          <IconButton
            aria-label="collapse hash"
            onClick={hashCollapse}
            sx={{
              ml: 1,
              mr: 0,
              p: 0,
              "&.MuiButtonBase-root:hover": {
                bgcolor: "transparent",
              },
            }}
          >
            <ChevronLeftRoundedIcon sx={{opacity: "0.5"}} />
          </IconButton>
        </Typography>
      </Popover>
    </Box>
  );
}

interface AssetHashButtonInnerProps extends BoxProps {
  hash: string;
  type: HashType;
  size?: "small" | "large";
  img?: string;
}

function AssetHashButtonInner({
  hash,
  type,
  size = "small",
  img,
}: AssetHashButtonInnerProps) {
  const {data: coinData} = useGetCoinList();
  const [copyTooltipOpen, setCopyTooltipOpen] = useState(false);
  const theme = useTheme();
  const semanticColors = getSemanticColors(theme.palette.mode);

  const legitCoin: CoinDescription | undefined = coinData?.data?.find(
    (coin: CoinDescription) => {
      const unverified = !coin.panoraTags.some((tag) => tag === "Verified");
      if (unverified) {
        return false;
      }
      if (type === HashType.COIN) {
        return coin.tokenAddress === hash;
      } else {
        return coin.faAddress === hash;
      }
    },
  );

  let coinName = hash;
  if (isValidAccountAddress(hash)) {
    coinName = standardizeAddress(hash);
  }
  const displayName = legitCoin
    ? size === "large"
      ? `${legitCoin.name} (${legitCoin.panoraSymbol ?? legitCoin.symbol})`
      : `${legitCoin.panoraSymbol ?? legitCoin.symbol}`
    : size === "large"
      ? truncateAddressMiddle(coinName)
      : truncateAddress(coinName);

  const copyAddress = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await navigator.clipboard.writeText(coinName);
    setCopyTooltipOpen(true);
    setTimeout(() => {
      setCopyTooltipOpen(false);
    }, 2000);
  };

  // Check if img is an emoji (including variation selectors like \uFE0F)
  // The regex matches one or more emoji characters, with optional variation selectors
  const imgIsEmoji = img && /^\p{Emoji}[\p{Emoji}\uFE0F]*$/u.test(img);
  let icon = null;
  if (img && imgIsEmoji) {
    icon = (
      <Box component="span" sx={{mr: 1, display: "flex", alignItems: "center"}}>
        {img}
      </Box>
    );
  } else if (img) {
    icon = (
      <Box component="span" sx={{mr: 1, display: "flex", alignItems: "center"}}>
        <img src={img} height={20} width={20} loading="lazy" alt="" />
      </Box>
    );
  } else if (legitCoin?.logoUrl) {
    icon = (
      <Box component="span" sx={{mr: 1, display: "flex", alignItems: "center"}}>
        <img
          src={legitCoin.logoUrl}
          height={20}
          width={20}
          loading="lazy"
          alt=""
        />
      </Box>
    );
  }

  return (
    <Stack direction="row" alignItems={"center"} spacing={1}>
      {icon}
      <Link
        to={getHashLinkStr(coinName, type)}
        sx={{
          backgroundColor: semanticColors.codeBlock.background,
          "&:hover": {
            backgroundColor: semanticColors.codeBlock.backgroundHover,
          },
          color: theme.palette.primary.main,
          padding: "0.15rem 0.35rem 0.15rem 1rem",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          borderRadius: 50,
          textDecoration: "none",
        }}
      >
        <Tooltip title={displayName} enterDelay={500} enterNextDelay={500}>
          <span>{displayName}</span>
        </Tooltip>
        <Tooltip title="Copied" open={copyTooltipOpen}>
          <Button
            sx={{
              color: "inherit",
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
              },
              padding: "0.25rem 0.5rem 0.25rem 0.5rem",
              margin: "0 0 0 0.2rem",
              minWidth: "unset",
              borderRadius: 50,
            }}
            onClick={copyAddress}
            endIcon={
              <ContentCopyIcon sx={{opacity: "0.75", mr: 1}} fontSize="small" />
            }
            size="small"
          />
        </Tooltip>
      </Link>
    </Stack>
  );
}

export default function HashButton({
  hash,
  type,
  size = "small",
  isValidator = false,
  img,
  ...props
}: HashButtonProps) {
  if (type === HashType.ACCOUNT || type === HashType.OBJECT) {
    return (
      <AccountHashButtonInner
        hash={hash}
        type={type}
        size={size}
        isValidator={isValidator}
        {...props}
      />
    );
  } else if (type === HashType.COIN || type === HashType.FUNGIBLE_ASSET) {
    return (
      <AssetHashButtonInner
        hash={hash}
        type={type}
        size={size}
        img={img}
        {...props}
      />
    );
  } else {
    return (
      <HashButtonInner
        hash={hash}
        type={type}
        size={size}
        img={img}
        {...props}
      />
    );
  }
}
