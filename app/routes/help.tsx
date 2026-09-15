import {createFileRoute, redirect} from "@tanstack/react-router";

export const Route = createFileRoute("/help")({
  beforeLoad: ({search}) => {
    const searchParams = search as {network?: string};
    throw redirect({
      to: "/guide",
      search: searchParams?.network
        ? {network: searchParams.network}
        : undefined,
    });
  },
  component: () => null,
});
