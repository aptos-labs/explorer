import React, {useState} from "react";
import {
  Box,
  Button,
  Link,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import {
  codeBlockColor,
  codeBlockColorClickableOnHover,
  grey,
} from "../themes/colors/aptosColorPalette";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import useMediaQuery from "@mui/material/useMediaQuery";
import {truncateAddress, truncateAddressMiddle} from "../pages/utils";
import {useGetNameFromAddress} from "../api/hooks/useGetANS";
import VerifiedOutlined from "@mui/icons-material/VerifiedOutlined";
import {scamAddresses} from "../constants";
import {tryStandardizeAddress} from "../utils";
import {DangerousOutlined} from "@mui/icons-material";

export const BUTTON_HEIGHT = 34;
export const TOOLTIP_TIME = 2000; // 2s

export enum HashType {
  ACCOUNT = "account",
  TRANSACTION = "transaction",
  NAME = "name",
  STRUCT = "struct",
  SYMBOL = "symbol",
}

interface TitleHashButtonProps {
  hash: string;
  type: HashType;
  isValidator?: boolean;
  nameType?: NameType;
}

export enum NameType {
  ANY = "any",
  ANS = "ans",
  LABEL = "label",
}

export default function TitleHashButton({
  hash,
  type,
  isValidator = false,
  nameType = NameType.ANY,
}: TitleHashButtonProps) {
  if (type !== HashType.NAME) {
    return <HashButton hash={hash} />;
  } else {
    return (
      <Name address={hash} isValidator={isValidator} nameType={nameType} />
    );
  }
}

function HashButton({hash}: {hash: string}) {
  const theme = useTheme();
  const isOnMobile = !useMediaQuery(theme.breakpoints.up("md"));
  const isOnSmallerScreen = !useMediaQuery(theme.breakpoints.up("lg"));

  const [tooltipOpen, setTooltipOpen] = useState<boolean>(false);

  const copyAddress = async () => {
    await navigator.clipboard.writeText(hash);

    setTooltipOpen(true);

    setTimeout(() => {
      setTooltipOpen(false);
    }, TOOLTIP_TIME);
  };

  const buttonComponent = (
    <Button
      sx={{
        height: BUTTON_HEIGHT,
        textTransform: "none",
        backgroundColor: `${
          theme.palette.mode === "dark" ? grey[600] : grey[200]
        }`,
        display: "flex",
        borderRadius: 1,
        color: "inherit",
        padding: "0.15rem 0.5rem 0.15rem 1rem",
        "&:hover": {
          backgroundColor: `${
            theme.palette.mode === "dark" ? grey[500] : grey[300]
          }`,
        },
      }}
      size="small"
      onClick={copyAddress}
      variant="contained"
      endIcon={
        <ContentCopyIcon
          fontSize="small"
          sx={{opacity: "0.75", my: 0.7, mr: 1}}
        />
      }
    >
      <Typography variant="body2">
        {isOnMobile
          ? truncateAddress(hash)
          : isOnSmallerScreen
            ? truncateAddressMiddle(hash)
            : hash}
      </Typography>
    </Button>
  );

  return (
    <Box>
      <Tooltip
        title="Copied"
        placement="bottom-end"
        open={tooltipOpen}
        disableFocusListener
        disableHoverListener
        disableTouchListener
      >
        {buttonComponent}
      </Tooltip>
    </Box>
  );
}

function Name({
  address,
  isValidator,
  nameType,
}: {
  address: string;
  isValidator: boolean;
  nameType?: NameType;
}) {
  const theme = useTheme();
  const name = useGetNameFromAddress(address, true, isValidator, nameType);

  if (!name) {
    return null;
  }
  const isAns = name.endsWith(".apt") || name.endsWith(".petra");

  const ansStyle = {
    height: BUTTON_HEIGHT,
    backgroundColor: `${theme.palette.mode === "dark" ? grey[600] : grey[200]}`,
    borderRadius: 1,
    color: "inherit",
    padding: "0.15rem 1rem 0.15rem 1rem",
  };

  const knownNameStyle = {
    height: BUTTON_HEIGHT,
    backgroundColor: codeBlockColor,
    "&:hover": {
      backgroundColor: codeBlockColorClickableOnHover,
    },
    color: theme.palette.primary.main,
    padding: "0.15rem 0.35rem 0.15rem 1rem",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    borderRadius: 50,
    textDecoration: "none",
  };

  let content;
  const addr = tryStandardizeAddress(address);
  if (isAns) {
    content = (
      <Link
        href={`https://www.aptosnames.com/name/${name}`}
        target="_blank"
        underline="none"
      >
        {name}
      </Link>
    );
  } else if (addr && scamAddresses[addr]) {
    content = (
      <Typography sx={{display: "flex", alignItems: "row", gap: 1}}>
        <span>{name}</span>
        <Tooltip title={"This is a known scam address."}>
          <DangerousOutlined
            fontSize="small"
            color="error"
            sx={{position: "relative", top: 2}}
          />
        </Tooltip>
      </Typography>
    );
  } else {
    content = (
      <Typography sx={{display: "flex", alignItems: "row", gap: 1}}>
        <span>{name}</span>
        <Tooltip title={"This is a verified address label."}>
          <VerifiedOutlined
            fontSize="small"
            color="info"
            sx={{position: "relative", top: 2}}
          />
        </Tooltip>
      </Typography>
    );
  }

  return (
    <Box>
      <Stack justifyContent="center" sx={isAns ? ansStyle : knownNameStyle}>
        {content}
      </Stack>
    </Box>
  );
}
