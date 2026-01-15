import {createFileRoute} from "@tanstack/react-router";
import {BASE_URL, DEFAULT_OG_IMAGE} from "../lib/constants";
import SettingsPage from "../pages/Settings/Index";
import {PagePending} from "../components/NavigationPending";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      {title: "Settings | Aptos Explorer"},
      {
        name: "description",
        content:
          "Configure explorer preferences such as feature modes and saved cookie settings.",
      },
      {property: "og:title", content: "Settings | Aptos Explorer"},
      {
        property: "og:description",
        content:
          "Configure explorer preferences such as feature modes and saved cookie settings.",
      },
      {property: "og:url", content: `${BASE_URL}/settings`},
      {property: "og:image", content: DEFAULT_OG_IMAGE},
      {name: "twitter:title", content: "Settings | Aptos Explorer"},
      {
        name: "twitter:description",
        content:
          "Configure explorer preferences such as feature modes and saved cookie settings.",
      },
    ],
    links: [{rel: "canonical", href: `${BASE_URL}/settings`}],
  }),
  pendingComponent: PagePending,
  component: SettingsPage,
});
