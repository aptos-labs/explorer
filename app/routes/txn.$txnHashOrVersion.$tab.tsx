import {createFileRoute} from "@tanstack/react-router";
import TransactionPage from "../pages/Transaction/Index";
import {BASE_URL, DEFAULT_OG_IMAGE} from "../lib/constants";
import {truncateAddress} from "../utils";
import {PagePending} from "../components/NavigationPending";
import {getClientFromSearch, getNetworkFromSearch} from "../api/createClient";
import {transactionQueryOptions} from "../api/queries";

// Primary route for transaction with tab in path
export const Route = createFileRoute("/txn/$txnHashOrVersion/$tab")({
  // Prefetch transaction data during navigation for faster perceived load
  loader: async ({params, context, location}) => {
    const {queryClient} = context;
    const search = Object.fromEntries(
      new URLSearchParams(location.search),
    ) as Record<string, string>;
    const client = getClientFromSearch(search);
    const networkName = getNetworkFromSearch(search);

    // Prefetch transaction data - don't await to avoid blocking navigation
    // Transactions are immutable so they cache very well
    queryClient
      .prefetchQuery(
        transactionQueryOptions(params.txnHashOrVersion, client, networkName),
      )
      .catch(() => {
        // Prefetch failures are non-critical - the component will fetch if needed
      });

    return {networkName};
  },
  head: ({params}) => {
    const tabTitle =
      params.tab === "balanceChange"
        ? "Balance Change"
        : params.tab === "events"
          ? "Events"
          : params.tab === "payload"
            ? "Payload"
            : params.tab === "changes"
              ? "Changes"
              : "Overview";
    return {
      meta: [
        {
          title: `${tabTitle} | Transaction ${truncateAddress(params.txnHashOrVersion)} | Aptos Explorer`,
        },
        {
          name: "description",
          content: `View ${tabTitle.toLowerCase()} for transaction ${params.txnHashOrVersion} on the Aptos blockchain.`,
        },
        {
          property: "og:title",
          content: `${tabTitle} | Transaction ${truncateAddress(params.txnHashOrVersion)} | Aptos Explorer`,
        },
        {
          property: "og:description",
          content: `View ${tabTitle.toLowerCase()} for transaction ${params.txnHashOrVersion} on the Aptos blockchain.`,
        },
        {
          property: "og:url",
          content: `${BASE_URL}/txn/${params.txnHashOrVersion}/${params.tab}`,
        },
        {property: "og:image", content: DEFAULT_OG_IMAGE},
        {
          name: "twitter:title",
          content: `${tabTitle} | Transaction ${truncateAddress(params.txnHashOrVersion)} | Aptos Explorer`,
        },
        {
          name: "twitter:description",
          content: `View ${tabTitle.toLowerCase()} for transaction ${params.txnHashOrVersion} on the Aptos blockchain.`,
        },
      ],
      links: [
        {
          rel: "canonical",
          href: `${BASE_URL}/txn/${params.txnHashOrVersion}/${params.tab}`,
        },
      ],
    };
  },
  pendingComponent: PagePending,
  component: TransactionPage,
});
