import {Box, Typography} from "@mui/material";
import {useParams} from "@tanstack/react-router";
import * as React from "react";
import {PageMetadata} from "../../../components/hooks/usePageMetadata";
import {OutOfCommissionPoolsBanner} from "../../../components/OutOfCommissionPoolsBanner";
import {Network} from "../../../constants";
import {useNetworkName} from "../../../global-config/GlobalConfig";
import {useNavigate} from "../../../routing";
import PageHeader from "../../layout/PageHeader";
import ValidatorsMap from "../ValidatorsMap";
import {validatorsTabHeadTitle} from "../validatorsTabMeta";
import EnhancedValidatorsPageTabs from "./EnhancedTabs";

export default function EnhancedValidatorsPage() {
  const networkName = useNetworkName();
  const navigate = useNavigate();
  const params = useParams({strict: false}) as {tab?: string};
  const tab = params.tab ?? "all";
  const tabTitle = validatorsTabHeadTitle(tab);

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
        title={`${tabTitle} | Validators`}
        description="View all validators on the Aptos blockchain network. Monitor validator performance, stake amounts, commission rates, and delegation status."
        type="website"
        canonicalPath={`/validators/${tab}`}
      />
      <PageHeader />
      <Typography variant="h3" sx={{marginBottom: 2}}>
        Validators
      </Typography>
      <OutOfCommissionPoolsBanner />
      {networkName === "mainnet" && <ValidatorsMap />}
      <EnhancedValidatorsPageTabs />
    </Box>
  );
}
