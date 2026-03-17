import {createFileRoute} from "@tanstack/react-router";
import {PagePending} from "../components/NavigationPending";
import {BASE_URL, DEFAULT_OG_IMAGE} from "../lib/constants";
import FAPage from "../pages/FungibleAsset/Index";
import {truncateAddress, tryStandardizeAddress} from "../utils";

// Primary route for fungible asset with tab in path
export const Route = createFileRoute("/fungible_asset/$address/$tab")({
  head: ({params}) => {
    const tabTitle =
      params.tab === "transactions"
        ? "Transactions"
        : params.tab === "holders"
          ? "Holders"
          : "Info";
    const address = tryStandardizeAddress(params.address) ?? params.address;
    return {
      meta: [
        {
          title: `${tabTitle} | Fungible Asset ${truncateAddress(address)} | Aptos Explorer`,
        },
        {
          name: "description",
          content: `View ${tabTitle.toLowerCase()} for fungible asset ${address} on the Aptos blockchain.`,
        },
        {
          property: "og:title",
          content: `${tabTitle} | Fungible Asset ${truncateAddress(address)} | Aptos Explorer`,
        },
        {
          property: "og:description",
          content: `View ${tabTitle.toLowerCase()} for fungible asset ${address} on the Aptos blockchain.`,
        },
        {
          property: "og:url",
          content: `${BASE_URL}/fungible_asset/${address}/${params.tab}`,
        },
        {property: "og:image", content: DEFAULT_OG_IMAGE},
        {
          name: "twitter:title",
          content: `${tabTitle} | Fungible Asset ${truncateAddress(address)} | Aptos Explorer`,
        },
        {
          name: "twitter:description",
          content: `View ${tabTitle.toLowerCase()} for fungible asset ${address} on the Aptos blockchain.`,
        },
      ],
      links: [
        {
          rel: "canonical",
          href: `${BASE_URL}/fungible_asset/${address}/${params.tab}`,
        },
      ],
    };
  },
  pendingComponent: PagePending,
  component: FAPage,
});
