import {createFileRoute, redirect} from "@tanstack/react-router";
import {PagePending} from "../components/NavigationPending";
import ReleasesPage from "../pages/Releases/Index";
import {DEFAULT_RELEASES_TAB, isReleasesTab} from "../pages/Releases/Tabs";

export const Route = createFileRoute("/releases/$tab")({
  // Reject unknown tab values up front rather than silently rendering the
  // default tab on a `/releases/<garbage>` URL — that creates duplicate-content
  // URLs and confuses share/bookmark behavior. Forward the existing
  // `?network=` selection through the redirect so users don't lose it.
  beforeLoad: ({params, search}) => {
    if (!isReleasesTab(params.tab)) {
      const searchParams = search as {network?: string};
      throw redirect({
        to: "/releases/$tab",
        params: {tab: DEFAULT_RELEASES_TAB},
        search: searchParams?.network
          ? {network: searchParams.network}
          : undefined,
        replace: true,
      });
    }
  },
  pendingComponent: PagePending,
  component: ReleasesPage,
});
