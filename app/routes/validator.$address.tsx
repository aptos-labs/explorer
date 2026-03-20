import {createFileRoute} from "@tanstack/react-router";
import {PagePending} from "../components/NavigationPending";
import ValidatorPage from "../pages/DelegatoryValidator/index";

export const Route = createFileRoute("/validator/$address")({
  pendingComponent: PagePending,
  component: ValidatorPage,
});
