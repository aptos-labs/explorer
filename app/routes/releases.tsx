import {createFileRoute, Outlet, redirect} from "@tanstack/react-router";

export const Route = createFileRoute("/releases")({
  beforeLoad: ({search, location}) => {
    const searchParams = search as {tab?: string; network?: string};

    const pathSegments = location.pathname.split("/").filter(Boolean);
    const isExactMatch = pathSegments.length === 1;

    if (searchParams?.tab) {
      throw redirect({
        to: "/releases/$tab",
        params: {tab: searchParams.tab},
        search: searchParams.network
          ? {network: searchParams.network}
          : undefined,
      });
    }
    if (isExactMatch) {
      throw redirect({
        to: "/releases/$tab",
        params: {tab: "networks"},
        search: searchParams?.network
          ? {network: searchParams.network}
          : undefined,
      });
    }
  },
  component: () => <Outlet />,
});
