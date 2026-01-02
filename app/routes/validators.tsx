import {createFileRoute} from "@tanstack/react-router";
import {BASE_URL, DEFAULT_OG_IMAGE} from "../lib/constants";
import ValidatorsPage from "../pages/Validators/Index";

export const Route = createFileRoute("/validators")({
  head: () => ({
    meta: [
      {title: "Validators | Aptos Explorer"},
      {
        name: "description",
        content:
          "View all validators on the Aptos blockchain network. Monitor validator performance, stake amounts, commission rates, and delegation status.",
      },
      {property: "og:title", content: "Validators | Aptos Explorer"},
      {
        property: "og:description",
        content:
          "View all validators on the Aptos blockchain network. Monitor validator performance, stake amounts, commission rates, and delegation status.",
      },
      {property: "og:url", content: `${BASE_URL}/validators`},
      {property: "og:image", content: DEFAULT_OG_IMAGE},
      {name: "twitter:title", content: "Validators | Aptos Explorer"},
      {
        name: "twitter:description",
        content:
          "View all validators on the Aptos blockchain network. Monitor validator performance, stake amounts, commission rates, and delegation status.",
      },
    ],
    links: [{rel: "canonical", href: `${BASE_URL}/validators`}],
  }),
  component: ValidatorsPage,
});
