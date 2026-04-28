import {createFileRoute} from "@tanstack/react-router";
import {PagePending} from "../components/NavigationPending";
import ReleasesPage from "../pages/Releases/Index";

export const Route = createFileRoute("/releases/$tab")({
  pendingComponent: PagePending,
  component: ReleasesPage,
});
