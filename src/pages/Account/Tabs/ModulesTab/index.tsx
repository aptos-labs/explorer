import ModulesTabs from "./Tabs";

type ModulesTabProps = {
  address: string;
  isObject: boolean;
};

export default function ModulesTab({address, isObject}: ModulesTabProps) {
  return <ModulesTabs address={address} isObject={isObject} />;
}
