import React from "react";
import AccountKeySection from "./AccountKeySection";
import AccountResourcesSection from "./AccountResourcesSection";
import AccountModulesSection from "./AccountModulesSection";

type RawDataTabProps = {
  address: string;
};

export default function RawDataTab({address}: RawDataTabProps) {
  return (
    <>
      <AccountKeySection address={address} />
      <AccountResourcesSection address={address} />
      <AccountModulesSection address={address} />
    </>
  );
}
