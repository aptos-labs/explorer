import {createFileRoute, redirect} from "@tanstack/react-router";

// Enhanced validators route redirects to main validators page with default tab
export const Route = createFileRoute("/validators-enhanced")({
  beforeLoad: () => {
    throw redirect({
      to: "/validators/$tab",
      params: {tab: "all"},
    });
  },
  component: () => null,
});
