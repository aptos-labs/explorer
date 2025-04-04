import {Box, Typography} from "@mui/material";
import {useGlobalState} from "../../global-config/GlobalConfig";
import PageHeader from "../layout/PageHeader";
import ValidatorsPageTabs from "./Tabs";
import ValidatorsMap from "./ValidatorsMap";
import {usePageMetadata} from "../../components/hooks/usePageMetadata";
import {OutOfCommissionPoolsBanner} from "../../components/OutOfCommissionPoolsBanner";
import {WalletDeprecationBanner} from "../../components/WalletDeprecationBanner";

export default function ValidatorsPage() {
  const [state] = useGlobalState();

  usePageMetadata({title: "Validators"});

  return (
    <Box>
      <PageHeader />
      <Typography variant="h3" marginBottom={2}>
        Validators
      </Typography>
      <OutOfCommissionPoolsBanner />
      <WalletDeprecationBanner />
      {state.network_name === "mainnet" && <ValidatorsMap />}
      <ValidatorsPageTabs />
    </Box>
  );
}
