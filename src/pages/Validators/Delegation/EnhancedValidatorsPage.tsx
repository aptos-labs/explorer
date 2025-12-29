import * as React from "react";
import {Box, Typography} from "@mui/material";
import {useNetworkName} from "../../../global-config/GlobalConfig";
import PageHeader from "../../layout/PageHeader";
import EnhancedValidatorsPageTabs from "./EnhancedTabs";
import ValidatorsMap from "../ValidatorsMap";
import {usePageMetadata} from "../../../components/hooks/usePageMetadata";
import {Network} from "../../../constants";
import {useNavigate} from "../../../routing";
import {OutOfCommissionPoolsBanner} from "../../../components/OutOfCommissionPoolsBanner";
import {WalletDeprecationBanner} from "../../../components/WalletDeprecationBanner";

export default function EnhancedValidatorsPage() {
  const networkName = useNetworkName();
  const navigate = useNavigate();

  usePageMetadata({title: "Validators"});

  React.useEffect(() => {
    if (networkName === Network.DEVNET) {
      navigate("/validators");
    }
  }, [networkName, navigate]);

  if (networkName === Network.DEVNET) {
    return null;
  }

  return (
    <Box>
      <PageHeader />
      <Typography variant="h3" marginBottom={2}>
        Validators
      </Typography>
      <OutOfCommissionPoolsBanner />
      <WalletDeprecationBanner />
      {networkName === "mainnet" && <ValidatorsMap />}
      <EnhancedValidatorsPageTabs />
    </Box>
  );
}
