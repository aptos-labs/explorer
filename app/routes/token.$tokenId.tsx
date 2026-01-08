import {createFileRoute, redirect} from "@tanstack/react-router";

// Redirect /token/:tokenId to /token/:tokenId/overview (default tab)
// Also handles backward compatibility: /token/:tokenId?tab=xxx -> /token/:tokenId/xxx
export const Route = createFileRoute("/token/$tokenId")({
  beforeLoad: ({params, search}) => {
    const searchParams = search as {tab?: string; propertyVersion?: string};
    // If there's a tab query param, redirect to path-based route
    if (searchParams?.tab) {
      throw redirect({
        to: "/token/$tokenId/$tab",
        params: {tokenId: params.tokenId, tab: searchParams.tab},
        search: searchParams.propertyVersion
          ? {propertyVersion: searchParams.propertyVersion}
          : undefined,
      });
    }
    // Default: redirect to "overview" tab, preserving propertyVersion if present
    throw redirect({
      to: "/token/$tokenId/$tab",
      params: {tokenId: params.tokenId, tab: "overview"},
      search: searchParams?.propertyVersion
        ? {propertyVersion: searchParams.propertyVersion}
        : undefined,
    });
  },
  component: () => null,
});
