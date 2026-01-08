import {createFileRoute, redirect} from "@tanstack/react-router";

// Enhanced validators route redirects to main validators page with default tab
export const Route = createFileRoute("/validators-enhanced")({
  beforeLoad: ({search}) => {
    const searchParams = search as {network?: string};

    throw redirect({
      to: "/validators/$tab",
      params: {tab: "all"},
      search: searchParams?.network
        ? {network: searchParams.network}
        : undefined,
    });
  },
  component: () => null,
});
