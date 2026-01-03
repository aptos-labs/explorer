import {createFileRoute} from "@tanstack/react-router";
import {BASE_URL, DEFAULT_OG_IMAGE} from "../lib/constants";
import TransactionsPage from "../pages/Transactions/Index";
import {PagePending} from "../components/NavigationPending";

export const Route = createFileRoute("/transactions")({
  head: () => ({
    meta: [
      {title: "Transactions | Aptos Explorer"},
      {
        name: "description",
        content:
          "Browse recent transactions on the Aptos blockchain. View transaction details, gas fees, sender and receiver addresses, and transaction status.",
      },
      {property: "og:title", content: "Transactions | Aptos Explorer"},
      {
        property: "og:description",
        content:
          "Browse recent transactions on the Aptos blockchain. View transaction details, gas fees, sender and receiver addresses, and transaction status.",
      },
      {property: "og:url", content: `${BASE_URL}/transactions`},
      {property: "og:image", content: DEFAULT_OG_IMAGE},
      {name: "twitter:title", content: "Transactions | Aptos Explorer"},
      {
        name: "twitter:description",
        content:
          "Browse recent transactions on the Aptos blockchain. View transaction details, gas fees, sender and receiver addresses, and transaction status.",
      },
    ],
    links: [{rel: "canonical", href: `${BASE_URL}/transactions`}],
  }),
  pendingComponent: PagePending,
  component: TransactionsPage,
});
