import {createFileRoute} from "@tanstack/react-router";
import {BASE_URL, DEFAULT_OG_IMAGE} from "../lib/constants";
import ValidatorsPage from "../pages/Validators/Index";
import {PagePending} from "../components/NavigationPending";

// Primary route for validators with tab in path
export const Route = createFileRoute("/validators/$tab")({
  head: ({params}) => {
    const tabTitle =
      params.tab === "delegation"
        ? "Delegation Nodes"
        : params.tab === "enhanced_delegation"
          ? "Enhanced Delegation"
          : "All Nodes";
    return {
      meta: [
        {title: `${tabTitle} | Validators | Aptos Explorer`},
        {
          name: "description",
          content:
            "View all validators on the Aptos blockchain network. Monitor validator performance, stake amounts, commission rates, and delegation status.",
        },
        {
          property: "og:title",
          content: `${tabTitle} | Validators | Aptos Explorer`,
        },
        {
          property: "og:description",
          content:
            "View all validators on the Aptos blockchain network. Monitor validator performance, stake amounts, commission rates, and delegation status.",
        },
        {property: "og:url", content: `${BASE_URL}/validators/${params.tab}`},
        {property: "og:image", content: DEFAULT_OG_IMAGE},
        {
          name: "twitter:title",
          content: `${tabTitle} | Validators | Aptos Explorer`,
        },
        {
          name: "twitter:description",
          content:
            "View all validators on the Aptos blockchain network. Monitor validator performance, stake amounts, commission rates, and delegation status.",
        },
      ],
      links: [{rel: "canonical", href: `${BASE_URL}/validators/${params.tab}`}],
    };
  },
  pendingComponent: PagePending,
  component: ValidatorsPage,
});
