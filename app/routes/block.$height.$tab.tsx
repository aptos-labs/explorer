import {createFileRoute} from "@tanstack/react-router";
import {getClientFromSearch, getNetworkFromSearch} from "../api/createClient";
import {blockQueryOptions} from "../api/queries";
import {PagePending} from "../components/NavigationPending";
import {networks} from "../constants";
import {BASE_URL, DEFAULT_OG_IMAGE} from "../lib/constants";
import BlockPage from "../pages/Block/Index";

// Primary route for block with tab in path
export const Route = createFileRoute("/block/$height/$tab")({
  // Prefetch block data during navigation for faster perceived load
  loader: async ({params, context, location}) => {
    const {queryClient} = context;
    const search = Object.fromEntries(
      new URLSearchParams(location.search),
    ) as Record<string, string>;
    const client = getClientFromSearch(search);
    const networkName = getNetworkFromSearch(search);
    const networkValue = networks[networkName];

    await queryClient.ensureQueryData(
      blockQueryOptions(params.height, client, networkValue),
    );

    return {};
  },
  head: ({params}) => {
    const tabTitle =
      params.tab === "transactions" ? "Transactions" : "Overview";
    return {
      meta: [
        {title: `${tabTitle} | Block ${params.height} | Aptos Explorer`},
        {
          name: "description",
          content: `View ${tabTitle.toLowerCase()} for block ${params.height} on the Aptos blockchain.`,
        },
        {
          property: "og:title",
          content: `${tabTitle} | Block ${params.height} | Aptos Explorer`,
        },
        {
          property: "og:description",
          content: `View ${tabTitle.toLowerCase()} for block ${params.height} on the Aptos blockchain.`,
        },
        {
          property: "og:url",
          content: `${BASE_URL}/block/${params.height}/${params.tab}`,
        },
        {property: "og:image", content: DEFAULT_OG_IMAGE},
        {
          name: "twitter:title",
          content: `${tabTitle} | Block ${params.height} | Aptos Explorer`,
        },
        {
          name: "twitter:description",
          content: `View ${tabTitle.toLowerCase()} for block ${params.height} on the Aptos blockchain.`,
        },
      ],
      links: [
        {
          rel: "canonical",
          href: `${BASE_URL}/block/${params.height}/${params.tab}`,
        },
      ],
    };
  },
  pendingComponent: PagePending,
  component: BlockPage,
});
