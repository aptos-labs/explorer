import {createFileRoute} from "@tanstack/react-router";
import {BASE_URL, DEFAULT_OG_IMAGE} from "../lib/constants";
import {truncateAddress} from "../utils";
import AccountPage from "../pages/Account/Index";
import {
  accountInfoQueryOptions,
  accountResourcesQueryOptions,
} from "../api/queries";
import {getClientFromSearch} from "../api/createClient";
import {PagePending} from "../components/NavigationPending";

export const Route = createFileRoute("/account/$address")({
  head: ({params}) => ({
    meta: [
      {title: `Account ${truncateAddress(params.address)} | Aptos Explorer`},
      {
        name: "description",
        content: `View account details for ${params.address} on the Aptos blockchain.`,
      },
      {
        property: "og:title",
        content: `Account ${truncateAddress(params.address)} | Aptos Explorer`,
      },
      {
        property: "og:description",
        content: `View account details for ${params.address} on the Aptos blockchain.`,
      },
      {property: "og:url", content: `${BASE_URL}/account/${params.address}`},
      {property: "og:image", content: DEFAULT_OG_IMAGE},
      {
        name: "twitter:title",
        content: `Account ${truncateAddress(params.address)} | Aptos Explorer`,
      },
      {
        name: "twitter:description",
        content: `View account details for ${params.address} on the Aptos blockchain.`,
      },
    ],
    links: [{rel: "canonical", href: `${BASE_URL}/account/${params.address}`}],
  }),
  // Loader prefetches account data
  loader: async ({context, params, location}) => {
    const search = location.search as Record<string, string | undefined>;
    const client = getClientFromSearch(search);

    // Prefetch account info and resources in parallel
    await Promise.all([
      context.queryClient.ensureQueryData(
        accountInfoQueryOptions(params.address, client),
      ),
      context.queryClient.ensureQueryData(
        accountResourcesQueryOptions(params.address, client),
      ),
    ]);

    return {};
  },
  pendingComponent: PagePending,
  component: AccountPage,
});
