import {createFileRoute} from "@tanstack/react-router";
import {PagePending} from "../components/NavigationPending";
import AnalyticsPage from "../pages/Analytics/Index";

export const Route = createFileRoute("/analytics")({
  pendingComponent: PagePending,
  component: AnalyticsPage,
});
