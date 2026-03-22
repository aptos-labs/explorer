import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {Button} from "@mui/material";
import {Banner} from "../../../components/Banner";

interface PetraVaultBannerProps {
  address: string;
}

export function PetraVaultBanner({address}: PetraVaultBannerProps) {
  const petraVaultUrl = `https://vault.petra.app/onboarding?address=${address}`;

  return (
    <Banner
      pillText="MULTISIG"
      pillColor="info"
      action={
        <Button
          variant="outlined"
          size="small"
          endIcon={<OpenInNewIcon />}
          onClick={() =>
            window.open(petraVaultUrl, "_blank", "noopener,noreferrer")
          }
          sx={{
            textTransform: "none",
            fontWeight: 600,
            whiteSpace: {xs: "normal", sm: "nowrap"},
          }}
        >
          Open in Petra Vault
        </Button>
      }
      sx={{marginBottom: 2}}
    >
      Manage this multisig account with Petra Vault
    </Banner>
  );
}
