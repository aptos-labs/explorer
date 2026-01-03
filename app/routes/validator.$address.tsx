import {createFileRoute} from "@tanstack/react-router";
import ValidatorPage from "../pages/DelegatoryValidator/index";
import {BASE_URL, DEFAULT_OG_IMAGE} from "../lib/constants";
import {truncateAddress} from "../utils";
import {PagePending} from "../components/NavigationPending";

export const Route = createFileRoute("/validator/$address")({
  head: ({params}) => ({
    meta: [
      {
        title: `Validator ${truncateAddress(params.address)} | Aptos Explorer`,
      },
      {
        name: "description",
        content: `View validator details for ${params.address} on the Aptos blockchain.`,
      },
      {
        property: "og:title",
        content: `Validator ${truncateAddress(params.address)} | Aptos Explorer`,
      },
      {
        property: "og:description",
        content: `View validator details for ${params.address} on the Aptos blockchain.`,
      },
      {property: "og:url", content: `${BASE_URL}/validator/${params.address}`},
      {property: "og:image", content: DEFAULT_OG_IMAGE},
      {
        name: "twitter:title",
        content: `Validator ${truncateAddress(params.address)} | Aptos Explorer`,
      },
      {
        name: "twitter:description",
        content: `View validator details for ${params.address} on the Aptos blockchain.`,
      },
    ],
    links: [
      {rel: "canonical", href: `${BASE_URL}/validator/${params.address}`},
    ],
  }),
  pendingComponent: PagePending,
  component: ValidatorPage,
});
