import {createFileRoute} from "@tanstack/react-router";
import {PagePending} from "../components/NavigationPending";
import {BASE_URL, DEFAULT_OG_IMAGE} from "../lib/constants";
import AccountPage from "../pages/Account/Index";
import {truncateAddress, tryStandardizeAddress} from "../utils";

// Primary route for object with tab in path
export const Route = createFileRoute("/object/$address/$tab")({
  head: ({params}) => {
    const tabTitle =
      params.tab === "transactions"
        ? "Transactions"
        : params.tab === "coins"
          ? "Assets"
          : params.tab === "tokens"
            ? "NFTs"
            : params.tab === "resources"
              ? "Resources"
              : params.tab === "modules"
                ? "Modules"
                : "Info";
    const address = tryStandardizeAddress(params.address) ?? params.address;
    return {
      meta: [
        {
          title: `${tabTitle} | Object ${truncateAddress(address)} | Aptos Explorer`,
        },
        {
          name: "description",
          content: `View ${tabTitle.toLowerCase()} for object ${address} on the Aptos blockchain.`,
        },
        {
          property: "og:title",
          content: `${tabTitle} | Object ${truncateAddress(address)} | Aptos Explorer`,
        },
        {
          property: "og:description",
          content: `View ${tabTitle.toLowerCase()} for object ${address} on the Aptos blockchain.`,
        },
        {
          property: "og:url",
          content: `${BASE_URL}/object/${address}/${params.tab}`,
        },
        {property: "og:image", content: DEFAULT_OG_IMAGE},
        {
          name: "twitter:title",
          content: `${tabTitle} | Object ${truncateAddress(address)} | Aptos Explorer`,
        },
        {
          name: "twitter:description",
          content: `View ${tabTitle.toLowerCase()} for object ${address} on the Aptos blockchain.`,
        },
      ],
      links: [
        {
          rel: "canonical",
          href: `${BASE_URL}/object/${address}/${params.tab}`,
        },
      ],
    };
  },
  pendingComponent: PagePending,
  component: ObjectPage,
});

function ObjectPage() {
  // Render AccountPage with isObject=true to handle object-specific behavior
  return <AccountPage isObject={true} />;
}
