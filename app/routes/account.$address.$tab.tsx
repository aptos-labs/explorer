import {createFileRoute} from "@tanstack/react-router";
import {getClientFromSearch, getNetworkFromSearch} from "../api/createClient";
import {accountResourcesQueryOptions} from "../api/queries";
import {PagePending} from "../components/NavigationPending";
import {networks} from "../constants";
import {BASE_URL, DEFAULT_OG_IMAGE} from "../lib/constants";
import AccountPage from "../pages/Account/Index";
import {truncateAddress} from "../utils";

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
    const networkValue = networks[networkName];

    await queryClient.ensureQueryData(
      accountResourcesQueryOptions(params.address, client, networkValue),
    );

    return {networkName};
  },
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
                : params.tab === "multisig"
                  ? "Multisig"
                  : params.tab === "gas-impact"
                    ? "Gas Impact"
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
