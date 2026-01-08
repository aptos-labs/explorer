import {createFileRoute} from "@tanstack/react-router";
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
    ],
  }),
  pendingComponent: PagePending,
  component: DocumentationPage,
});
