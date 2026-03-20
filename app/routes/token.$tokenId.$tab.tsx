import {createFileRoute, redirect} from "@tanstack/react-router";
import {PagePending} from "../components/NavigationPending";
import TokenPage from "../pages/Token/Index";

// Primary route for token with tab in path
// Also handles backward compatibility for old /token/:tokenId/:propertyVersion routes
export const Route = createFileRoute("/token/$tokenId/$tab")({
  beforeLoad: ({params, search}) => {
    const searchParams = search as {network?: string};

    // Check if the "tab" is actually a numeric propertyVersion (backward compatibility)
    // Property versions are numeric strings like "0", "1", etc.
    if (/^\d+$/.test(params.tab)) {
      // This is actually a legacy propertyVersion URL, redirect to overview with propertyVersion in query
      throw redirect({
        to: "/token/$tokenId/$tab",
        params: {tokenId: params.tokenId, tab: "overview"},
        search: {
          ...(params.tab !== "0" && {propertyVersion: params.tab}),
          ...(searchParams?.network && {network: searchParams.network}),
        },
      });
    }
    // Continue with normal route handling if it's a valid tab
    return;
  },
  pendingComponent: PagePending,
  component: TokenPage,
});
