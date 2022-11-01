import React, {useState} from "react";
import {
  Box,
  BoxProps,
  Button,
  Typography,
  Popover,
  IconButton,
  useTheme,
  Link,
} from "@mui/material";
import * as RRD from "react-router-dom";
import {grey} from "../themes/colors/aptosColorPalette";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import PersonIcon from "@mui/icons-material/Person";
import {truncateAddress, truncateAddressMiddle} from "../pages/utils";
import {assertNever} from "../utils";
import {useGetNameFromAddress} from "../api/hooks/useGetANS";

export enum HashType {
  ACCOUNT = "account",
  THIS_ACCOUNT = "this_account",
  TRANSACTION = "transaction",
  OTHERS = "others",
}

function getHashLinkStr(hash: string, type: HashType): string {
  switch (type) {
    case HashType.ACCOUNT:
    case HashType.THIS_ACCOUNT:
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
    case HashType.THIS_ACCOUNT:
    case HashType.TRANSACTION:
      return (
        <Link
          component={RRD.Link}
          to={getHashLinkStr(hash, type)}
          color="inherit"
        >
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
}

export default function HashButton({
  hash,
  type,
  size = "small",
  ...props
}: HashButtonProps) {
  if (type === HashType.ACCOUNT) {
    return (
      <AccountHashButtonInner hash={hash} type={type} size={size} {...props} />
    );
  } else if (type === HashType.THIS_ACCOUNT) {
    return (
      <HashButtonInner
        label={<PersonIcon fontSize="small" />}
        hash={hash}
        type={type}
        size={size}
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
}

function AccountHashButtonInner({
  hash,
  type,
  size = "small",
  ...props
}: AccountHashButtonInnerProps) {
  const name = useGetNameFromAddress(hash);

  return (
    <HashButtonInner
      label={name}
      hash={hash}
      type={type}
      size={size}
      {...props}
    />
  );
}

interface HashButtonInnerProps extends BoxProps {
  label?: React.ReactNode;
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

  const expandable = type !== HashType.THIS_ACCOUNT;

  return (
    <Box {...props}>
      <Button
        sx={{
          height: 30,
          textTransform: "none",
          backgroundColor: `${
            theme.palette.mode === "dark" ? grey[600] : grey[200]
          }`,
          display: "flex",
          borderRadius: 1,
          color: "inherit",
          padding: expandable
            ? "0.15rem 0.5rem 0.15rem 1rem"
            : "0.15rem 1rem 0.15rem 1rem",
          "&:hover": {
            backgroundColor: expandable
              ? `${theme.palette.mode === "dark" ? grey[500] : grey[300]}`
              : `${theme.palette.mode === "dark" ? grey[600] : grey[200]}`,
          },
          minWidth: 141,
        }}
        aria-describedby={id}
        onClick={expandable ? hashExpand : () => {}}
        variant="contained"
        endIcon={
          expandable ? (
            <ChevronRightRoundedIcon sx={{opacity: "0.75", m: 0}} />
          ) : null
        }
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
