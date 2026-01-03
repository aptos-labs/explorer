import {createFileRoute} from "@tanstack/react-router";
import VerificationPage from "../pages/Verification/Index";
import {BASE_URL, DEFAULT_OG_IMAGE} from "../lib/constants";
import {PagePending} from "../components/NavigationPending";

export const Route = createFileRoute("/verification")({
  head: () => ({
    meta: [
      {title: "Token & Address Verification | Aptos Explorer"},
      {
        name: "description",
        content:
          "Learn how to verify tokens and addresses on Aptos Explorer. Get your project verified through the Panora token list or address verification process.",
      },
      {
        property: "og:title",
        content: "Token & Address Verification | Aptos Explorer",
      },
      {
        property: "og:description",
        content:
          "Learn how to verify tokens and addresses on Aptos Explorer. Get your project verified through the Panora token list or address verification process.",
      },
      {property: "og:url", content: `${BASE_URL}/verification`},
      {property: "og:image", content: DEFAULT_OG_IMAGE},
      {
        name: "twitter:title",
        content: "Token & Address Verification | Aptos Explorer",
      },
      {
        name: "twitter:description",
        content:
          "Learn how to verify tokens and addresses on Aptos Explorer. Get your project verified through the Panora token list or address verification process.",
      },
    ],
    links: [{rel: "canonical", href: `${BASE_URL}/verification`}],
  }),
  pendingComponent: PagePending,
  component: VerificationPage,
});
