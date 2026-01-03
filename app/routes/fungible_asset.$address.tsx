import {createFileRoute} from "@tanstack/react-router";
import {BASE_URL, DEFAULT_OG_IMAGE} from "../lib/constants";
import {truncateAddress} from "../utils";
import FAPage from "../pages/FungibleAsset/Index";
import {PagePending} from "../components/NavigationPending";

export const Route = createFileRoute("/fungible_asset/$address")({
  head: ({params}) => ({
    meta: [
      {
        title: `Fungible Asset ${truncateAddress(params.address)} | Aptos Explorer`,
      },
      {
        name: "description",
        content: `View fungible asset details for ${params.address} on the Aptos blockchain.`,
      },
      {
        property: "og:title",
        content: `Fungible Asset ${truncateAddress(params.address)} | Aptos Explorer`,
      },
      {
        property: "og:description",
        content: `View fungible asset details for ${params.address} on the Aptos blockchain.`,
      },
      {
        property: "og:url",
        content: `${BASE_URL}/fungible_asset/${params.address}`,
      },
      {property: "og:image", content: DEFAULT_OG_IMAGE},
      {
        name: "twitter:title",
        content: `Fungible Asset ${truncateAddress(params.address)} | Aptos Explorer`,
      },
      {
        name: "twitter:description",
        content: `View fungible asset details for ${params.address} on the Aptos blockchain.`,
      },
    ],
    links: [
      {rel: "canonical", href: `${BASE_URL}/fungible_asset/${params.address}`},
    ],
  }),
  pendingComponent: PagePending,
  component: FAPage,
});
