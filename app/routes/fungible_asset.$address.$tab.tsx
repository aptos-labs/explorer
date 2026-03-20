import {createFileRoute} from "@tanstack/react-router";
import {PagePending} from "../components/NavigationPending";
import FAPage from "../pages/FungibleAsset/Index";

// Primary route for fungible asset with tab in path
export const Route = createFileRoute("/fungible_asset/$address/$tab")({
  pendingComponent: PagePending,
  component: FAPage,
});
