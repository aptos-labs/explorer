import {createFileRoute} from "@tanstack/react-router";
import {PagePending} from "../components/NavigationPending";
import GuidePage from "../pages/Guide/GuidePage";

export const Route = createFileRoute("/guide")({
  pendingComponent: PagePending,
  component: GuidePage,
});
