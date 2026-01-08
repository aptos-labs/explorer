import {createFileRoute, redirect} from "@tanstack/react-router";
import TokenPage from "../pages/Token/Index";
import {BASE_URL, DEFAULT_OG_IMAGE} from "../lib/constants";
import {truncateAddress} from "../utils";
import {PagePending} from "../components/NavigationPending";

// Primary route for token with tab in path
// Also handles backward compatibility for old /token/:tokenId/:propertyVersion routes
export const Route = createFileRoute("/token/$tokenId/$tab")({
  beforeLoad: ({params}) => {
    // Check if the "tab" is actually a numeric propertyVersion (backward compatibility)
    // Property versions are numeric strings like "0", "1", etc.
    if (/^\d+$/.test(params.tab)) {
      // This is actually a legacy propertyVersion URL, redirect to overview with propertyVersion in query
      throw redirect({
        to: "/token/$tokenId/$tab",
        params: {tokenId: params.tokenId, tab: "overview"},
        search: params.tab !== "0" ? {propertyVersion: params.tab} : undefined,
      });
    }
    // Continue with normal route handling if it's a valid tab
    return;
  },
  head: ({params}) => {
    const tabTitle = params.tab === "activities" ? "Activities" : "Overview";
    return {
      meta: [
        {
          title: `${tabTitle} | Token ${truncateAddress(params.tokenId)} | Aptos Explorer`,
        },
        {
          name: "description",
          content: `View ${tabTitle.toLowerCase()} for NFT token ${params.tokenId} on the Aptos blockchain.`,
        },
        {
          property: "og:title",
          content: `${tabTitle} | Token ${truncateAddress(params.tokenId)} | Aptos Explorer`,
        },
        {
          property: "og:description",
          content: `View ${tabTitle.toLowerCase()} for NFT token ${params.tokenId} on the Aptos blockchain.`,
        },
        {
          property: "og:url",
          content: `${BASE_URL}/token/${params.tokenId}/${params.tab}`,
        },
        {property: "og:image", content: DEFAULT_OG_IMAGE},
        {
          name: "twitter:title",
          content: `${tabTitle} | Token ${truncateAddress(params.tokenId)} | Aptos Explorer`,
        },
        {
          name: "twitter:description",
          content: `View ${tabTitle.toLowerCase()} for NFT token ${params.tokenId} on the Aptos blockchain.`,
        },
      ],
      links: [
        {
          rel: "canonical",
          href: `${BASE_URL}/token/${params.tokenId}/${params.tab}`,
        },
      ],
    };
  },
  pendingComponent: PagePending,
  component: TokenPage,
});
