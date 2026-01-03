import {createFileRoute, redirect} from "@tanstack/react-router";

// Backward compatibility: redirect /token/:tokenId/:propertyVersion to /token/:tokenId?propertyVersion=:propertyVersion
export const Route = createFileRoute("/token/$tokenId/$propertyVersion")({
  beforeLoad: ({params}) => {
    throw redirect({
      to: "/token/$tokenId",
      params: {tokenId: params.tokenId},
      search:
        params.propertyVersion && params.propertyVersion !== "0"
          ? {propertyVersion: params.propertyVersion}
          : {},
    });
  },
  component: () => null,
});
