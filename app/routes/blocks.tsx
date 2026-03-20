import {createFileRoute} from "@tanstack/react-router";
import {PagePending} from "../components/NavigationPending";
import BlocksPage from "../pages/Blocks/Index";

export const Route = createFileRoute("/blocks")({
  pendingComponent: PagePending,
  component: BlocksPage,
});
