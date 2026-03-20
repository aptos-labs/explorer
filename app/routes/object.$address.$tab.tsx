import {createFileRoute} from "@tanstack/react-router";
import {PagePending} from "../components/NavigationPending";
import AccountPage from "../pages/Account/Index";

// Primary route for object with tab in path
export const Route = createFileRoute("/object/$address/$tab")({
  pendingComponent: PagePending,
  component: ObjectPage,
});

function ObjectPage() {
  // Render AccountPage with isObject=true to handle object-specific behavior
  return <AccountPage isObject={true} />;
}
