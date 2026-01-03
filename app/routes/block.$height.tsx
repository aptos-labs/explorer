import {createFileRoute} from "@tanstack/react-router";
import BlockPage from "../pages/Block/Index";
import {BASE_URL, DEFAULT_OG_IMAGE} from "../lib/constants";
import {PagePending} from "../components/NavigationPending";

export const Route = createFileRoute("/block/$height")({
  head: ({params}) => ({
    meta: [
      {title: `Block ${params.height} | Aptos Explorer`},
      {
        name: "description",
        content: `View block ${params.height} details on the Aptos blockchain.`,
      },
      {
        property: "og:title",
        content: `Block ${params.height} | Aptos Explorer`,
      },
      {
        property: "og:description",
        content: `View block ${params.height} details on the Aptos blockchain.`,
      },
      {property: "og:url", content: `${BASE_URL}/block/${params.height}`},
      {property: "og:image", content: DEFAULT_OG_IMAGE},
      {
        name: "twitter:title",
        content: `Block ${params.height} | Aptos Explorer`,
      },
      {
        name: "twitter:description",
        content: `View block ${params.height} details on the Aptos blockchain.`,
      },
    ],
    links: [{rel: "canonical", href: `${BASE_URL}/block/${params.height}`}],
  }),
  pendingComponent: PagePending,
  component: BlockPage,
});
