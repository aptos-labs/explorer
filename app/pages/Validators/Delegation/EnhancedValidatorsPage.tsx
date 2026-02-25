import {Box, Typography} from "@mui/material";
import * as React from "react";
import {PageMetadata} from "../../../components/hooks/usePageMetadata";
import {OutOfCommissionPoolsBanner} from "../../../components/OutOfCommissionPoolsBanner";
import {Network} from "../../../constants";
import {useNetworkName} from "../../../global-config/GlobalConfig";
import {useNavigate} from "../../../routing";
import PageHeader from "../../layout/PageHeader";
import ValidatorsMap from "../ValidatorsMap";
import EnhancedValidatorsPageTabs from "./EnhancedTabs";

export default function EnhancedValidatorsPage() {
  const networkName = useNetworkName();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (networkName === Network.DEVNET) {
      navigate({to: "/validators"});
    }
  }, [networkName, navigate]);

  if (networkName === Network.DEVNET) {
    return null;
  }

  return (
    <Box>
      <PageMetadata
        title="Validators"
        description="View all validators on the Aptos blockchain network. Monitor validator performance, stake amounts, commission rates, and delegation status."
      />
      <PageHeader />
      <Typography variant="h3" marginBottom={2}>
        Validators
      </Typography>
      <OutOfCommissionPoolsBanner />
      {networkName === "mainnet" && <ValidatorsMap />}
      <EnhancedValidatorsPageTabs />
    </Box>
  );
}
