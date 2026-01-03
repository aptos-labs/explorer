import {createFileRoute} from "@tanstack/react-router";
import {BASE_URL, DEFAULT_OG_IMAGE} from "../lib/constants";
import BlocksPage from "../pages/Blocks/Index";
import {PagePending} from "../components/NavigationPending";

export const Route = createFileRoute("/blocks")({
  head: () => ({
    meta: [
      {title: "Latest Blocks | Aptos Explorer"},
      {
        name: "description",
        content:
          "View the latest blocks produced on the Aptos blockchain. Monitor block height, timestamps, proposers, and included transactions.",
      },
      {property: "og:title", content: "Latest Blocks | Aptos Explorer"},
      {
        property: "og:description",
        content:
          "View the latest blocks produced on the Aptos blockchain. Monitor block height, timestamps, proposers, and included transactions.",
      },
      {property: "og:url", content: `${BASE_URL}/blocks`},
      {property: "og:image", content: DEFAULT_OG_IMAGE},
      {name: "twitter:title", content: "Latest Blocks | Aptos Explorer"},
      {
        name: "twitter:description",
        content:
          "View the latest blocks produced on the Aptos blockchain. Monitor block height, timestamps, proposers, and included transactions.",
      },
    ],
    links: [{rel: "canonical", href: `${BASE_URL}/blocks`}],
  }),
  pendingComponent: PagePending,
  component: BlocksPage,
});
