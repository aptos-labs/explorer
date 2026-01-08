import {createFileRoute, useParams} from "@tanstack/react-router";
import ModulesTabs from "../pages/Account/Tabs/ModulesTab/Tabs";

// Splat route for /account/:address/modules/*
// Captures: /modules/code, /modules/code/MyModule, /modules/view/MyModule/myFunc, etc.
export const Route = createFileRoute("/account/$address/modules/$")({
  component: ModulesPage,
});

function ModulesPage() {
  const {address} = useParams({strict: false}) as {address: string};
  return <ModulesTabs address={address} isObject={false} />;
}
