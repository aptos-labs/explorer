"use client";

import dynamic from "next/dynamic";

const ExplorerLayout = dynamic(() => import("../pages/layout/index"), {ssr: false});

export default function Page() {
  return <ExplorerLayout />;
}
