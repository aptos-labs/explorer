import {createFileRoute} from "@tanstack/react-router";
import {BASE_URL, DEFAULT_OG_IMAGE} from "../lib/constants";
import {truncateAddress} from "../utils";
import AccountPage from "../pages/Account/Index";
import {PagePending} from "../components/NavigationPending";
import {getClientFromSearch, getNetworkFromSearch} from "../api/createClient";
import {accountInfoQueryOptions} from "../api/queries";

// Primary route for account with tab in path
export const Route = createFileRoute("/account/$address/$tab")({
  // Prefetch account data during navigation for faster perceived load
  loader: async ({params, context, location}) => {
    const {queryClient} = context;
    const search = Object.fromEntries(
      new URLSearchParams(location.search),
    ) as Record<string, string>;
    const client = getClientFromSearch(search);
    const networkName = getNetworkFromSearch(search);

    // Prefetch account info - don't await to avoid blocking navigation
    // This runs in parallel with rendering
    queryClient.prefetchQuery(accountInfoQueryOptions(params.address, client));

    return {networkName};
  },
  head: ({params}) => {
    const tabTitle =
      params.tab === "transactions"
        ? "Transactions"
        : params.tab === "coins"
          ? "Coins"
          : params.tab === "tokens"
            ? "Tokens"
            : params.tab === "resources"
              ? "Resources"
              : params.tab === "modules"
                ? "Modules"
                : params.tab === "multisig"
                  ? "Multisig"
                  : "Info";
    return {
      meta: [
        {
          title: `${tabTitle} | Account ${truncateAddress(params.address)} | Aptos Explorer`,
        },
        {
          name: "description",
          content: `View ${tabTitle.toLowerCase()} for account ${params.address} on the Aptos blockchain.`,
        },
        {
          property: "og:title",
          content: `${tabTitle} | Account ${truncateAddress(params.address)} | Aptos Explorer`,
        },
        {
          property: "og:description",
          content: `View ${tabTitle.toLowerCase()} for account ${params.address} on the Aptos blockchain.`,
        },
        {
          property: "og:url",
          content: `${BASE_URL}/account/${params.address}/${params.tab}`,
        },
        {property: "og:image", content: DEFAULT_OG_IMAGE},
        {
          name: "twitter:title",
          content: `${tabTitle} | Account ${truncateAddress(params.address)} | Aptos Explorer`,
        },
        {
          name: "twitter:description",
          content: `View ${tabTitle.toLowerCase()} for account ${params.address} on the Aptos blockchain.`,
        },
      ],
      links: [
        {
          rel: "canonical",
          href: `${BASE_URL}/account/${params.address}/${params.tab}`,
        },
      ],
    };
  },
  pendingComponent: PagePending,
  component: AccountPage,
});
