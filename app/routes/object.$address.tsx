import React from "react";
import {createFileRoute, redirect} from "@tanstack/react-router";

// Object routes redirect to account with isObject flag
export const Route = createFileRoute("/object/$address")({
  beforeLoad: ({params}) => {
    // Redirect object routes to account routes
    // The account page handles both accounts and objects
    throw redirect({
      to: "/account/$address",
      params: {address: params.address},
      search: {type: "object"},
    });
  },
  component: () => null,
});
