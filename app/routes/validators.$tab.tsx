import {createFileRoute} from "@tanstack/react-router";
import {PagePending} from "../components/NavigationPending";
import ValidatorsPage from "../pages/Validators/Index";

// Primary route for validators with tab in path
export const Route = createFileRoute("/validators/$tab")({
  pendingComponent: PagePending,
  component: ValidatorsPage,
});
