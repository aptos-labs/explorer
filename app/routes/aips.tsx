import {createFileRoute} from "@tanstack/react-router";
import {PagePending} from "../components/NavigationPending";
import AIpsPage from "../pages/AIPs/Index";

export const Route = createFileRoute("/aips")({
  pendingComponent: PagePending,
  component: AIpsPage,
});
