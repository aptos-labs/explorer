import {createFileRoute} from "@tanstack/react-router";
import {BASE_URL, DEFAULT_OG_IMAGE} from "../lib/constants";
import {truncateAddress} from "../utils";
import FAPage from "../pages/FungibleAsset/Index";
import {PagePending} from "../components/NavigationPending";

// Primary route for fungible asset with tab in path
export const Route = createFileRoute("/fungible_asset/$address/$tab")({
  head: ({params}) => {
    const tabTitle =
      params.tab === "transactions"
        ? "Transactions"
        : params.tab === "holders"
          ? "Holders"
          : "Info";
    return {
      meta: [
        {
          title: `${tabTitle} | Fungible Asset ${truncateAddress(params.address)} | Aptos Explorer`,
        },
        {
          name: "description",
          content: `View ${tabTitle.toLowerCase()} for fungible asset ${params.address} on the Aptos blockchain.`,
        },
        {
          property: "og:title",
          content: `${tabTitle} | Fungible Asset ${truncateAddress(params.address)} | Aptos Explorer`,
        },
        {
          property: "og:description",
          content: `View ${tabTitle.toLowerCase()} for fungible asset ${params.address} on the Aptos blockchain.`,
        },
        {
          property: "og:url",
          content: `${BASE_URL}/fungible_asset/${params.address}/${params.tab}`,
        },
        {property: "og:image", content: DEFAULT_OG_IMAGE},
        {
          name: "twitter:title",
          content: `${tabTitle} | Fungible Asset ${truncateAddress(params.address)} | Aptos Explorer`,
        },
        {
          name: "twitter:description",
          content: `View ${tabTitle.toLowerCase()} for fungible asset ${params.address} on the Aptos blockchain.`,
        },
      ],
      links: [
        {
          rel: "canonical",
          href: `${BASE_URL}/fungible_asset/${params.address}/${params.tab}`,
        },
      ],
    };
  },
  pendingComponent: PagePending,
  component: FAPage,
});
