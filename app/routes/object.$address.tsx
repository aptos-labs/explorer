import {createFileRoute} from "@tanstack/react-router";
import {BASE_URL, DEFAULT_OG_IMAGE} from "../lib/constants";
import {truncateAddress} from "../utils";
import AccountPage from "../pages/Account/Index";
import {PagePending} from "../components/NavigationPending";

export const Route = createFileRoute("/object/$address")({
  head: ({params}) => ({
    meta: [
      {
        title: `Object ${truncateAddress(params.address)} | Aptos Explorer`,
      },
      {
        name: "description",
        content: `View object details for ${params.address} on the Aptos blockchain.`,
      },
      {
        property: "og:title",
        content: `Object ${truncateAddress(params.address)} | Aptos Explorer`,
      },
      {
        property: "og:description",
        content: `View object details for ${params.address} on the Aptos blockchain.`,
      },
      {
        property: "og:url",
        content: `${BASE_URL}/object/${params.address}`,
      },
      {property: "og:image", content: DEFAULT_OG_IMAGE},
      {
        name: "twitter:title",
        content: `Object ${truncateAddress(params.address)} | Aptos Explorer`,
      },
      {
        name: "twitter:description",
        content: `View object details for ${params.address} on the Aptos blockchain.`,
      },
    ],
    links: [{rel: "canonical", href: `${BASE_URL}/object/${params.address}`}],
  }),
  pendingComponent: PagePending,
  component: ObjectPage,
});

function ObjectPage() {
  // Render AccountPage with isObject=true to handle object-specific behavior
  return <AccountPage isObject={true} />;
}
