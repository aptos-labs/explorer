import {createFileRoute} from "@tanstack/react-router";
import {PagePending} from "../components/NavigationPending";
import CoinPage from "../pages/Coin/Index";

// Primary route for coin with tab in path
export const Route = createFileRoute("/coin/$struct/$tab")({
  pendingComponent: PagePending,
  component: CoinPage,
});
