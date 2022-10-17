import * as React from "react";
import HeaderSearch from "../pages/layout/Search/Index";
import GoBack from "./GoBack";

export default function PageHeader() {
  return (
    <>
      <GoBack />
      <HeaderSearch />
    </>
  );
}
