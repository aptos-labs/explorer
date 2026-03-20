import {createFileRoute} from "@tanstack/react-router";
import {PagePending} from "../components/NavigationPending";
import TransactionsPage from "../pages/Transactions/Index";

export const Route = createFileRoute("/transactions")({
  pendingComponent: PagePending,
  component: TransactionsPage,
});
