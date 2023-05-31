import ModulesTabs from "./Tabs";

type ModulesTabProps = {
  address: string;
};

export default function ModulesTab({address}: ModulesTabProps) {
  return <ModulesTabs address={address} />;
}
