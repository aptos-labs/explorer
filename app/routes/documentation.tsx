import {createFileRoute} from "@tanstack/react-router";
import {BASE_URL, DEFAULT_OG_IMAGE} from "../lib/constants";
import DocumentationPage from "../pages/Documentation/Index";
import {PagePending} from "../components/NavigationPending";

export const Route = createFileRoute("/documentation")({
  head: () => ({
    meta: [
      {title: "Documentation | Aptos Explorer"},
      {
        name: "description",
        content:
          "Learn how to use the Aptos Explorer to view transactions, blocks, validators, accounts, and network analytics.",
      },
      {property: "og:title", content: "Documentation | Aptos Explorer"},
      {
        property: "og:description",
        content:
          "Learn how to use the Aptos Explorer to view transactions, blocks, validators, accounts, and network analytics.",
      },
      {property: "og:url", content: `${BASE_URL}/documentation`},
      {property: "og:image", content: DEFAULT_OG_IMAGE},
      {name: "twitter:title", content: "Documentation | Aptos Explorer"},
      {
        name: "twitter:description",
        content:
          "Learn how to use the Aptos Explorer to view transactions, blocks, validators, accounts, and network analytics.",
      },
    ],
    links: [{rel: "canonical", href: `${BASE_URL}/documentation`}],
  }),
  pendingComponent: PagePending,
  component: DocumentationPage,
});
