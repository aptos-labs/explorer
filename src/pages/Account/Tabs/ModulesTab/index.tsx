import {Box} from "@mui/material";
import React from "react";
import {useGlobalState} from "../../../../global-config/GlobalConfig";
import ModulesTabs from "./Tabs";
import ViewCode from "./ViewCode";

type ModulesTabProps = {
  address: string;
};

export default function ModulesTab({address}: ModulesTabProps) {
  const [state, _] = useGlobalState();
  if (state.feature_name === "dev") return <ModulesTabs address={address} />;
  return (
    <Box marginTop={4}>
      <ViewCode address={address} />
    </Box>
  );
}
