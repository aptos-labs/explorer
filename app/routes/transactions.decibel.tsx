import {createFileRoute} from "@tanstack/react-router";
import {PagePending} from "../components/NavigationPending";
import DecibelTransactionsPage from "../pages/DecibelTransactions/Index";

export const Route = createFileRoute("/transactions/decibel")({
  pendingComponent: PagePending,
  component: DecibelTransactionsPage,
});
