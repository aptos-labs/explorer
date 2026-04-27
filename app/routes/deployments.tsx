import {createFileRoute} from "@tanstack/react-router";
import {PagePending} from "../components/NavigationPending";
import DeploymentsPage from "../pages/Deployments/Index";

export const Route = createFileRoute("/deployments")({
  pendingComponent: PagePending,
  component: DeploymentsPage,
});
