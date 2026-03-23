import {createFileRoute, useParams} from "@tanstack/react-router";
import AccountPage from "../pages/Account/Index";
import ModulesTabs from "../pages/Account/Tabs/ModulesTab/Tabs";

// Splat route for /account/:address/modules/*
// Captures: /modules/code, /modules/code/MyModule, /modules/view/MyModule/myFunc, etc.
export const Route = createFileRoute("/account/$address/modules/$")({
  component: ModulesPage,
});

function ModulesPage() {
  const params = useParams({strict: false}) as {address?: unknown};
  const address = typeof params.address === "string" ? params.address : "";

  return (
    <AccountPage>
      <ModulesTabs address={address} isObject={false} />
    </AccountPage>
  );
}
