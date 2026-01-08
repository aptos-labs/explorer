import {createFileRoute} from "@tanstack/react-router";
import {BASE_URL, DEFAULT_OG_IMAGE} from "../lib/constants";
import CoinPage from "../pages/Coin/Index";
import {PagePending} from "../components/NavigationPending";

// Primary route for coin with tab in path
export const Route = createFileRoute("/coin/$struct/$tab")({
  head: ({params}) => {
    const tabTitle =
      params.tab === "transactions"
        ? "Transactions"
        : params.tab === "holders"
          ? "Holders"
          : "Info";
    return {
      meta: [
        {title: `${tabTitle} | Coin ${params.struct} | Aptos Explorer`},
        {
          name: "description",
          content: `View ${tabTitle.toLowerCase()} for coin ${params.struct} on the Aptos blockchain.`,
        },
        {
          property: "og:title",
          content: `${tabTitle} | Coin ${params.struct} | Aptos Explorer`,
        },
        {
          property: "og:description",
          content: `View ${tabTitle.toLowerCase()} for coin ${params.struct} on the Aptos blockchain.`,
        },
        {
          property: "og:url",
          content: `${BASE_URL}/coin/${params.struct}/${params.tab}`,
        },
        {property: "og:image", content: DEFAULT_OG_IMAGE},
        {
          name: "twitter:title",
          content: `${tabTitle} | Coin ${params.struct} | Aptos Explorer`,
        },
        {
          name: "twitter:description",
          content: `View ${tabTitle.toLowerCase()} for coin ${params.struct} on the Aptos blockchain.`,
        },
      ],
      links: [
        {
          rel: "canonical",
          href: `${BASE_URL}/coin/${params.struct}/${params.tab}`,
        },
      ],
    };
  },
  pendingComponent: PagePending,
  component: CoinPage,
});
