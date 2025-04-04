import * as React from "react";
import {Box, Typography} from "@mui/material";
import {useGlobalState} from "../../../global-config/GlobalConfig";
import PageHeader from "../../layout/PageHeader";
import EnhancedValidatorsPageTabs from "./EnhancedTabs";
import ValidatorsMap from "../ValidatorsMap";
import {usePageMetadata} from "../../../components/hooks/usePageMetadata";
import {Network} from "../../../constants";
import {useNavigate} from "../../../routing";
import {OutOfCommissionPoolsBanner} from "../../../components/OutOfCommissionPoolsBanner";
import {WalletDeprecationBanner} from "../../../components/WalletDeprecationBanner";

export default function EnhancedValidatorsPage() {
  const [state] = useGlobalState();
  const navigate = useNavigate();

  usePageMetadata({title: "Validators"});

  React.useEffect(() => {
    if (state.network_name === Network.DEVNET) {
      navigate("/validators");
    }
  }, [state.network_name, navigate]);

  if (state.network_name === Network.DEVNET) {
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
      {state.network_name === "mainnet" && <ValidatorsMap />}
      <EnhancedValidatorsPageTabs />
    </Box>
  );
}
