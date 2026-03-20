import {createFileRoute} from "@tanstack/react-router";
import {PagePending} from "../components/NavigationPending";
import CoinsPage from "../pages/Coins/Index";

export const Route = createFileRoute("/coins")({
  pendingComponent: PagePending,
  component: CoinsPage,
});
