import {createFileRoute} from "@tanstack/react-router";
import TransactionPage from "../pages/Transaction/Index";
import {BASE_URL, DEFAULT_OG_IMAGE} from "../lib/constants";
import {truncateAddress} from "../utils";

export const Route = createFileRoute("/txn/$txnHashOrVersion")({
  head: ({params}) => ({
    meta: [
      {
        title: `Transaction ${truncateAddress(params.txnHashOrVersion)} | Aptos Explorer`,
      },
      {
        name: "description",
        content: `View transaction details for ${params.txnHashOrVersion} on the Aptos blockchain.`,
      },
      {
        property: "og:title",
        content: `Transaction ${truncateAddress(params.txnHashOrVersion)} | Aptos Explorer`,
      },
      {
        property: "og:description",
        content: `View transaction details for ${params.txnHashOrVersion} on the Aptos blockchain.`,
      },
      {
        property: "og:url",
        content: `${BASE_URL}/txn/${params.txnHashOrVersion}`,
      },
      {property: "og:image", content: DEFAULT_OG_IMAGE},
      {
        name: "twitter:title",
        content: `Transaction ${truncateAddress(params.txnHashOrVersion)} | Aptos Explorer`,
      },
      {
        name: "twitter:description",
        content: `View transaction details for ${params.txnHashOrVersion} on the Aptos blockchain.`,
      },
    ],
    links: [
      {
        rel: "canonical",
        href: `${BASE_URL}/txn/${params.txnHashOrVersion}`,
      },
    ],
  }),
  component: TransactionPage,
});
