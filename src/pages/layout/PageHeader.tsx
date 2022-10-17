import * as React from "react";
import HeaderSearch from "./Search/Index";
import GoBack from "../../components/GoBack";

export default function PageHeader() {
  return (
    <>
      <GoBack />
      <HeaderSearch />
    </>
  );
}
