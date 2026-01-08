import {createFileRoute} from "@tanstack/react-router";
import BlockPage from "../pages/Block/Index";
import {BASE_URL, DEFAULT_OG_IMAGE} from "../lib/constants";
import {PagePending} from "../components/NavigationPending";

// Primary route for block with tab in path
export const Route = createFileRoute("/block/$height/$tab")({
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
