import {createFileRoute} from "@tanstack/react-router";
import {BASE_URL, DEFAULT_OG_IMAGE} from "../lib/constants";
import CoinPage from "../pages/Coin/Index";
import {PagePending} from "../components/NavigationPending";

export const Route = createFileRoute("/coin/$struct")({
  head: ({params}) => ({
    meta: [
      {title: `Coin ${params.struct} | Aptos Explorer`},
      {
        name: "description",
        content: `View coin details for ${params.struct} on the Aptos blockchain.`,
      },
      {property: "og:title", content: `Coin ${params.struct} | Aptos Explorer`},
      {
        property: "og:description",
        content: `View coin details for ${params.struct} on the Aptos blockchain.`,
      },
      {property: "og:url", content: `${BASE_URL}/coin/${params.struct}`},
      {property: "og:image", content: DEFAULT_OG_IMAGE},
      {
        name: "twitter:title",
        content: `Coin ${params.struct} | Aptos Explorer`,
      },
      {
        name: "twitter:description",
        content: `View coin details for ${params.struct} on the Aptos blockchain.`,
      },
    ],
    links: [{rel: "canonical", href: `${BASE_URL}/coin/${params.struct}`}],
  }),
  pendingComponent: PagePending,
  component: CoinPage,
});
