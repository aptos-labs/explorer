import {createFileRoute} from "@tanstack/react-router";
import {PagePending} from "../components/NavigationPending";
import {BASE_URL, DEFAULT_OG_IMAGE} from "../lib/constants";
import ValidatorPage from "../pages/DelegatoryValidator/index";
import {truncateAddress, tryStandardizeAddress} from "../utils";

export const Route = createFileRoute("/validator/$address")({
  head: ({params}) => {
    const address = tryStandardizeAddress(params.address) ?? params.address;
    return {
      meta: [
        {
          title: `Validator ${truncateAddress(address)} | Aptos Explorer`,
        },
        {
          name: "description",
          content: `View validator details for ${address} on the Aptos blockchain.`,
        },
        {
          property: "og:title",
          content: `Validator ${truncateAddress(address)} | Aptos Explorer`,
        },
        {
          property: "og:description",
          content: `View validator details for ${address} on the Aptos blockchain.`,
        },
        {property: "og:url", content: `${BASE_URL}/validator/${address}`},
        {property: "og:image", content: DEFAULT_OG_IMAGE},
        {
          name: "twitter:title",
          content: `Validator ${truncateAddress(address)} | Aptos Explorer`,
        },
        {
          name: "twitter:description",
          content: `View validator details for ${address} on the Aptos blockchain.`,
        },
      ],
      links: [{rel: "canonical", href: `${BASE_URL}/validator/${address}`}],
    };
  },
  pendingComponent: PagePending,
  component: ValidatorPage,
});
