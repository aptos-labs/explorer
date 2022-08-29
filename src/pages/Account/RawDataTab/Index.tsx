import React from "react";
import AccountKeySection from "./AccountKeySection";
import AccountResourcesSection from "./AccountResourcesSection";
import AccountModulesSection from "./AccountModulesSection";
import Box from "@mui/material/Box";

type RawDataTabProps = {
  address: string;
};

export default function RawDataTab({address}: RawDataTabProps) {
  return (
    <Box marginX={2} marginTop={5}>
      <AccountKeySection address={address} />
      <AccountResourcesSection address={address} />
      <AccountModulesSection address={address} />
    </Box>
  );
}
