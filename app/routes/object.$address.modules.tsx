import {createFileRoute, Outlet, redirect} from "@tanstack/react-router";

// Layout route for /object/:address/modules/*
// Handles backward compatibility redirects from query params to path-based routes
export const Route = createFileRoute("/object/$address/modules")({
  beforeLoad: ({params, search, location}) => {
    const searchParams = search as {
      modulesTab?: string;
      selectedModuleName?: string;
      selectedFnName?: string;
      network?: string;
    };

    // Check if we're on the exact /object/:address/modules path (no child route)
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const isExactMatch = pathSegments.length === 3; // ["object", "address", "modules"]

    // If there are query params, redirect to path-based route for backward compatibility
    if (searchParams?.modulesTab) {
      const modulesTab = searchParams.modulesTab;
      const moduleName = searchParams.selectedModuleName;
      const fnName = searchParams.selectedFnName;

      // Build the splat path based on available params
      let splatPath = modulesTab;
      if (moduleName) {
        splatPath += `/${moduleName}`;
        if (fnName) {
          splatPath += `/${fnName}`;
        }
      }

      throw redirect({
        to: "/object/$address/modules/$",
        params: {address: params.address, _splat: splatPath},
        search: searchParams.network
          ? {network: searchParams.network}
          : undefined,
      });
    }

    // Default: redirect to "packages" tab only if on exact path
    if (isExactMatch) {
      throw redirect({
        to: "/object/$address/modules/$",
        params: {address: params.address, _splat: "packages"},
        search: searchParams?.network
          ? {network: searchParams.network}
          : undefined,
      });
    }
  },
  component: () => <Outlet />,
});
