import {createFileRoute, Outlet, redirect} from "@tanstack/react-router";
import {rewriteValidatorsTab} from "../utils/routeRedirects";

// Enhanced validators route redirects to the main validators page.
// Exact `/validators-enhanced` goes to `/validators/all`; child `$tab`
// routes are handled by `validators-enhanced.$tab.tsx`.
export const Route = createFileRoute("/validators-enhanced")({
  beforeLoad: ({search, location}) => {
    const searchParams = search as {tab?: string; network?: string};
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const isExactMatch = pathSegments.length === 1; // ["validators-enhanced"]

    if (searchParams?.tab) {
      throw redirect({
        to: "/validators/$tab",
        params: {tab: rewriteValidatorsTab(searchParams.tab)},
        search: searchParams.network
          ? {network: searchParams.network}
          : undefined,
      });
    }

    if (isExactMatch) {
      throw redirect({
        to: "/validators/$tab",
        params: {tab: "all"},
        search: searchParams?.network
          ? {network: searchParams.network}
          : undefined,
      });
    }
  },
  component: () => <Outlet />,
});
