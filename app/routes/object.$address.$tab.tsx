import {createFileRoute} from "@tanstack/react-router";
import {loadAccountPagePrefetch} from "../api/prefetchEntityPages";
import AccountPage from "../pages/Account/Index";

// Primary route for object with tab in path
export const Route = createFileRoute("/object/$address/$tab")({
  loader: ({params, context, location}) =>
    loadAccountPagePrefetch({
      address: params.address,
      queryClient: context.queryClient,
      search: location.search,
    }),
  component: ObjectPage,
});

function ObjectPage() {
  // Render AccountPage with isObject=true to handle object-specific behavior
  return <AccountPage isObject={true} />;
}
