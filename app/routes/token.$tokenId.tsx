import {createFileRoute} from "@tanstack/react-router";
import TokenPage from "../pages/Token/Index";
import {BASE_URL, DEFAULT_OG_IMAGE} from "../lib/constants";
import {truncateAddress} from "../utils";
import {PagePending} from "../components/NavigationPending";

export const Route = createFileRoute("/token/$tokenId")({
  head: ({params}) => ({
    meta: [
      {title: `Token ${truncateAddress(params.tokenId)} | Aptos Explorer`},
      {
        name: "description",
        content: `View NFT token details for ${params.tokenId} on the Aptos blockchain.`,
      },
      {
        property: "og:title",
        content: `Token ${truncateAddress(params.tokenId)} | Aptos Explorer`,
      },
      {
        property: "og:description",
        content: `View NFT token details for ${params.tokenId} on the Aptos blockchain.`,
      },
      {property: "og:url", content: `${BASE_URL}/token/${params.tokenId}`},
      {property: "og:image", content: DEFAULT_OG_IMAGE},
      {
        name: "twitter:title",
        content: `Token ${truncateAddress(params.tokenId)} | Aptos Explorer`,
      },
      {
        name: "twitter:description",
        content: `View NFT token details for ${params.tokenId} on the Aptos blockchain.`,
      },
    ],
    links: [{rel: "canonical", href: `${BASE_URL}/token/${params.tokenId}`}],
  }),
  pendingComponent: PagePending,
  component: TokenPage,
});
