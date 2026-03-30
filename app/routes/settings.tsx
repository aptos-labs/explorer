import {createFileRoute} from "@tanstack/react-router";
import {PagePending} from "../components/NavigationPending";
import SettingsPage from "../pages/Settings/SettingsPage";

export const Route = createFileRoute("/settings")({
  pendingComponent: PagePending,
  component: SettingsPage,
});
