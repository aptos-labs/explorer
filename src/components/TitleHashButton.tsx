import React, {useState} from "react";
import {Box, Button, Stack, Tooltip, Typography, useTheme} from "@mui/material";
import {grey} from "../themes/colors/aptosColorPalette";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import useMediaQuery from "@mui/material/useMediaQuery";
import {truncateAddress, truncateAddressMiddle} from "../pages/utils";
import {useGetNameFromAddress} from "../api/hooks/useGetANS";

const BUTTON_HEIGHT = 34;
const TOOLTIP_TIME = 2000; // 2s

export enum HashType {
  ACCOUNT = "account",
  TRANSACTION = "transaction",
  NAME = "name",
}

interface TitleHashButtonProps {
  hash: string;
  type: HashType;
}

export default function TitleHashButton({hash, type}: TitleHashButtonProps) {
  if (type !== HashType.NAME) {
    return <HashButton hash={hash} />;
  } else {
    return <Name address={hash} />;
  }
}

function HashButton({hash}: {hash: string}) {
  const theme = useTheme();
  const isOnMobile = !useMediaQuery(theme.breakpoints.up("md"));
  const isOnSmallerScreen = !useMediaQuery(theme.breakpoints.up("lg"));

  const [tooltipOpen, setTooltipOpen] = useState<boolean>(false);

  const copyAddress = async (event: React.MouseEvent<HTMLButtonElement>) => {
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

function Name({address}: {address: string}) {
  const theme = useTheme();
  const name = useGetNameFromAddress(address);

  if (!name) {
    return null;
  }

  return (
    <Box>
      <Stack
        justifyContent="center"
        sx={{
          height: BUTTON_HEIGHT,
          backgroundColor: `${
            theme.palette.mode === "dark" ? grey[600] : grey[200]
          }`,
          borderRadius: 1,
          color: "inherit",
          padding: "0.15rem 1rem 0.15rem 1rem",
        }}
      >
        <Typography variant="body2">{name}</Typography>
      </Stack>
    </Box>
  );
}
