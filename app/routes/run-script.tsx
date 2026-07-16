import {createFileRoute} from "@tanstack/react-router";
import {PagePending} from "../components/NavigationPending";
import RunScriptPage from "../pages/RunScript/Index";

export const Route = createFileRoute("/run-script")({
  pendingComponent: PagePending,
  component: RunScriptPage,
});
