import {createFileRoute} from "@tanstack/react-router";
import {PagePending} from "../components/NavigationPending";
import {BASE_URL} from "../lib/constants";
import SearchPage from "../pages/Search/Index";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  head: () => ({
    meta: [
      {title: "Search | Aptos Explorer"},
      {
        name: "description",
        content:
          "Search for accounts, transactions, blocks, coins, and tokens on the Aptos blockchain.",
      },
      // Search result pages are dynamic — keep them out of indexes
      {name: "robots", content: "noindex, follow"},
      {property: "og:title", content: "Search | Aptos Explorer"},
    ],
    links: [{rel: "canonical", href: `${BASE_URL}/search`}],
  }),
  pendingComponent: PagePending,
  component: SearchPage,
});
