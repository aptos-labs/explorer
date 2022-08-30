import React from "react";
import {Box, Button, useTheme} from "@mui/material";
import {grey} from "../../../themes/colors/aptosColorPalette";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import useMediaQuery from "@mui/material/useMediaQuery";
import {truncateAddress} from "../../../pages/utils";

interface AddressButtonProps {
  hash: string;
}

// TODO: generalize the hash button in page title
export default function TransactionButton({hash}: AddressButtonProps) {
  const theme = useTheme();
  const isOnMobile = !useMediaQuery(theme.breakpoints.up("md"));

  const copyAddress = (event: React.MouseEvent<HTMLButtonElement>) => {
    // TODO: add copy to clipboard feature
  };

  return (
    <Box>
      <Button
        sx={{
          textTransform: "none",
          backgroundColor: `${
            theme.palette.mode === "dark" ? grey[700] : grey[100]
          }`,
          display: "flex",
          borderRadius: 1,
          color: "inherit",
          padding: "0.15rem 0.5rem 0.15rem 1rem",
          "&:hover": {
            backgroundColor: `${
              theme.palette.mode === "dark" ? grey[700] : grey[100]
            }`,
          },
        }}
        size="large"
        onClick={copyAddress}
        variant="contained"
        endIcon={
          <ContentCopyIcon
            fontSize="small"
            sx={{opacity: "0.75", my: 0.7, mr: 1}}
          />
        }
      >
        {isOnMobile ? truncateAddress(hash) : hash}
      </Button>
    </Box>
  );
}
