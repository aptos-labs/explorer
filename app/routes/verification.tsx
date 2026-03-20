import {createFileRoute} from "@tanstack/react-router";
import {PagePending} from "../components/NavigationPending";
import VerificationPage from "../pages/Verification/Index";

export const Route = createFileRoute("/verification")({
  pendingComponent: PagePending,
  component: VerificationPage,
});
