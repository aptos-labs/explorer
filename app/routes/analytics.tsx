import {createFileRoute} from "@tanstack/react-router";
import {BASE_URL, DEFAULT_OG_IMAGE} from "../lib/constants";
import AnalyticsPage from "../pages/Analytics/Index";
import {PagePending} from "../components/NavigationPending";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      {title: "Network Analytics | Aptos Explorer"},
      {
        name: "description",
        content:
          "View Aptos network analytics including daily active users, transaction volumes, gas fees, block production, and other key blockchain metrics.",
      },
      {property: "og:title", content: "Network Analytics | Aptos Explorer"},
      {
        property: "og:description",
        content:
          "View Aptos network analytics including daily active users, transaction volumes, gas fees, block production, and other key blockchain metrics.",
      },
      {property: "og:url", content: `${BASE_URL}/analytics`},
      {property: "og:image", content: DEFAULT_OG_IMAGE},
      {name: "twitter:title", content: "Network Analytics | Aptos Explorer"},
      {
        name: "twitter:description",
        content:
          "View Aptos network analytics including daily active users, transaction volumes, gas fees, block production, and other key blockchain metrics.",
      },
    ],
    links: [{rel: "canonical", href: `${BASE_URL}/analytics`}],
  }),
  pendingComponent: PagePending,
  component: AnalyticsPage,
});
