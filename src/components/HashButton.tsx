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
} from "@mui/material";
import {
  codeBlockColor,
  codeBlockColorClickableOnHover,
  grey,
  primary,
} from "../themes/colors/aptosColorPalette";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import {truncateAddress, truncateAddressMiddle} from "../pages/utils";
import {assertNever} from "../utils";
import {useGetNameFromAddress} from "../api/hooks/useGetANS";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import IdenticonImg from "./IdenticonImg";
import {Link} from "../routing";

export enum HashType {
  ACCOUNT = "account",
  TRANSACTION = "transaction",
  OTHERS = "others",
}

function getHashLinkStr(hash: string, type: HashType): string {
  switch (type) {
    case HashType.ACCOUNT:
      return `/account/${hash}`;
    case HashType.TRANSACTION:
      return `/txn/${hash}`;
    case HashType.OTHERS:
      return "";
    default:
      return assertNever(type);
  }
}

function HashLink(hash: string, type: HashType): JSX.Element {
  switch (type) {
    case HashType.ACCOUNT:
    case HashType.TRANSACTION:
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
}

export default function HashButton({
  hash,
  type,
  size = "small",
  isValidator = false,
  ...props
}: HashButtonProps) {
  if (type === HashType.ACCOUNT) {
    return (
      <AccountHashButtonInner
        hash={hash}
        type={type}
        size={size}
        isValidator={isValidator}
        {...props}
      />
    );
  } else {
    return <HashButtonInner hash={hash} type={type} size={size} {...props} />;
  }
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
  const name = useGetNameFromAddress(hash, false, isValidator);
  const truncateHash =
    size === "large" ? truncateAddressMiddle(hash) : truncateAddress(hash);
  const [copyTooltipOpen, setCopyTooltipOpen] = useState(false);
  const theme = useTheme();
  const copyAddress = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await navigator.clipboard.writeText(hash);
    setCopyTooltipOpen(true);
    setTimeout(() => {
      setCopyTooltipOpen(false);
    }, 2000);
  };

  return (
    <Stack direction="row" alignItems={"center"} spacing={1}>
      <IdenticonImg address={hash} />
      <Link
        to={getHashLinkStr(hash, type)}
        sx={{
          backgroundColor: codeBlockColor,
          "&:hover": {
            backgroundColor: codeBlockColorClickableOnHover,
          },
          color: theme.palette.mode === "dark" ? "#3a73fe" : "#3a73fe",
          padding: "0.15rem 0.35rem 0.15rem 1rem",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          borderRadius: 0,
          textDecoration: "none",
        }}
      >
        <Tooltip title={hash} enterDelay={500} enterNextDelay={500}>
          <span>{name ?? truncateHash}</span>
        </Tooltip>
        <Tooltip title="Copied" open={copyTooltipOpen}>
          <Button
            sx={{
              color: "inherit",
              "&:hover": {
                backgroundColor: `${
                  theme.palette.mode === "dark" ? primary[100] : primary[100]
                }`,
                color: `${
                  theme.palette.mode === "dark" ? grey[100] : grey[100]
                }`,
              },
              padding: "0.25rem 0.5rem 0.25rem 0.5rem",
              margin: "0 0 0 0.2rem",
              minWidth: "unset", // remove minimum width
              borderRadius: 0,
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
}

function HashButtonInner({
  label,
  hash,
  type,
  size = "small",
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

  const truncateHash =
    size === "large" ? truncateAddressMiddle(hash) : truncateAddress(hash);

  return (
    <Box {...props}>
      <Button
        sx={{
          textTransform: "none",
          backgroundColor: `${
            theme.palette.mode === "dark" ? grey[600] : grey[200]
          }`,
          display: "flex",
          borderRadius: 0,
          color: "inherit",
          padding: "0.15rem 0.5rem 0.15rem 1rem",
          "&:hover": {
            backgroundColor: `${
              theme.palette.mode === "dark" ? grey[500] : grey[300]
            }`,
          },
          minWidth: 141,
        }}
        aria-describedby={id}
        onClick={hashExpand}
        variant="contained"
        endIcon={<ChevronRightRoundedIcon sx={{opacity: "0.75", m: 0}} />}
      >
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
            backgroundColor: `${
              theme.palette.mode === "dark"
                ? "rgba(18,22,21,0.5)"
                : "rgba(255,255,255,0.5)"
            }`,
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
            backgroundColor: `${
              theme.palette.mode === "dark" ? grey[600] : grey[200]
            }`,
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
