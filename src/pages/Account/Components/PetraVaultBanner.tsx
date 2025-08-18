import React from "react";
import {Banner} from "../../../components/Banner";
import {Button, Stack, useMediaQuery, useTheme} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

interface PetraVaultBannerProps {
  address: string;
}

export function PetraVaultBanner({address}: PetraVaultBannerProps) {
  const theme = useTheme();
  const isOnMobile = !useMediaQuery(theme.breakpoints.up("md"));

  const petraVaultUrl = `https://vault.petra.app/onboarding?address=${address}`;

  const vaultButton = (
    <Button
      variant="contained"
      color="primary"
      size="small"
      endIcon={<OpenInNewIcon />}
      onClick={() =>
        window.open(petraVaultUrl, "_blank", "noopener,noreferrer")
      }
      sx={{
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        color: "white",
        "&:hover": {
          backgroundColor: "rgba(255, 255, 255, 0.3)",
        },
        textTransform: "none",
        fontWeight: 600,
      }}
    >
      Open in Petra Vault
    </Button>
  );

  const action = isOnMobile ? null : vaultButton;
  const text = "Manage this multisig account with Petra Vault";

  const children = isOnMobile ? (
    <Stack direction="column" spacing={1}>
      {text}
      {vaultButton}
    </Stack>
  ) : (
    <>{text}</>
  );

  return (
    <Banner
      pillText="MULTISIG"
      pillColor="info"
      action={action}
      sx={{marginBottom: 2}}
    >
      {children}
    </Banner>
  );
}
