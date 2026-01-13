import {createFileRoute} from "@tanstack/react-router";
import {BASE_URL, DEFAULT_OG_IMAGE} from "../lib/constants";
import CoinsPage from "../pages/Coins/Index";
import {PagePending} from "../components/NavigationPending";

export const Route = createFileRoute("/coins")({
  head: () => ({
    meta: [
      {title: "Coins & Fungible Assets | Aptos Explorer"},
      {
        name: "description",
        content:
          "Browse the top coins and fungible assets on the Aptos blockchain. View token details, supply, price, market cap, and verification status.",
      },
      {
        property: "og:title",
        content: "Coins & Fungible Assets | Aptos Explorer",
      },
      {
        property: "og:description",
        content:
          "Browse the top coins and fungible assets on the Aptos blockchain. View token details, supply, price, market cap, and verification status.",
      },
      {property: "og:url", content: `${BASE_URL}/coins`},
      {property: "og:image", content: DEFAULT_OG_IMAGE},
      {
        name: "twitter:title",
        content: "Coins & Fungible Assets | Aptos Explorer",
      },
      {
        name: "twitter:description",
        content:
          "Browse the top coins and fungible assets on the Aptos blockchain. View token details, supply, price, market cap, and verification status.",
      },
    ],
    links: [{rel: "canonical", href: `${BASE_URL}/coins`}],
  }),
  pendingComponent: PagePending,
  component: CoinsPage,
});
