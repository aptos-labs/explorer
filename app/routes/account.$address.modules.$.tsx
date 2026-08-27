import {createFileRoute, useParams} from "@tanstack/react-router";
import {loadAccountPagePrefetch} from "../api/prefetchEntityPages";
import AccountPage from "../pages/Account/Index";
import ModulesTabs from "../pages/Account/Tabs/ModulesTab/Tabs";

// Splat route for /account/:address/modules/*
export const Route = createFileRoute("/account/$address/modules/$")({
  loader: ({params, context, location}) =>
    loadAccountPagePrefetch({
      address: params.address,
      queryClient: context.queryClient,
      search: location.search,
    }),
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
