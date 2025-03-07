import {Box, Typography} from "@mui/material";
import {useGlobalState} from "../../global-config/GlobalConfig";
import PageHeader from "../layout/PageHeader";
import ValidatorsPageTabs from "./Tabs";
import ValidatorsMap from "./ValidatorsMap";
import {CommissionChangeBanner} from "./CommissionChangeBanner";
import {usePageMetadata} from "../../components/hooks/usePageMetadata";

export default function ValidatorsPage() {
  const [state] = useGlobalState();

  usePageMetadata({title: "Validators"});

  return (
    <Box>
      <PageHeader />
      <Typography variant="h3" marginBottom={2}>
        Validators
      </Typography>
      <CommissionChangeBanner />
      {state.network_name === "mainnet" && <ValidatorsMap />}
      <ValidatorsPageTabs />
    </Box>
  );
}
