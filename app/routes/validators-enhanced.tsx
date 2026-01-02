import React from "react";
import {createFileRoute, redirect} from "@tanstack/react-router";

// Enhanced validators route redirects to main validators page
export const Route = createFileRoute("/validators-enhanced")({
  beforeLoad: () => {
    throw redirect({
      to: "/validators",
    });
  },
  component: () => null,
});
