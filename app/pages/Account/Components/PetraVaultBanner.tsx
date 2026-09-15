import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {Button} from "@mui/material";
import {Banner} from "../../../components/Banner";
import {useTranslation} from "../../../i18n";

interface PetraVaultBannerProps {
  address: string;
}

export function PetraVaultBanner({address}: PetraVaultBannerProps) {
  const {t} = useTranslation();
  const petraVaultUrl = `https://vault.petra.app/onboarding?address=${address}`;

  return (
    <Banner
      pillText={t("accountUi.pill.multisig")}
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
          {t("accountUi.openPetraVault")}
        </Button>
      }
      sx={{marginBottom: 2}}
    >
      {t("accountUi.manageMultisig")}
    </Banner>
  );
}
