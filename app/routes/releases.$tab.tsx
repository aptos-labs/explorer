import {createFileRoute, redirect} from "@tanstack/react-router";
import {PagePending} from "../components/NavigationPending";
import ReleasesPage from "../pages/Releases/Index";
import {DEFAULT_RELEASES_TAB, isReleasesTab} from "../pages/Releases/Tabs";

export const Route = createFileRoute("/releases/$tab")({
  // Reject unknown tab values up front rather than silently rendering the
  // default tab on a `/releases/<garbage>` URL — that creates duplicate-content
  // URLs and confuses share/bookmark behavior.
  beforeLoad: ({params}) => {
    if (!isReleasesTab(params.tab)) {
      throw redirect({
        to: "/releases/$tab",
        params: {tab: DEFAULT_RELEASES_TAB},
        replace: true,
      });
    }
  },
  pendingComponent: PagePending,
  component: ReleasesPage,
});
