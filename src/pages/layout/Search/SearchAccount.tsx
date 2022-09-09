import React from "react";
import {useGetAccountResources} from "../../../api/hooks/useGetAccountResources";
import ResultLink from "./ResultLink";

type SearchAccountProps = {
  address: string;
};

export default function SearchAccount({address}: SearchAccountProps) {
  const {isLoading, error, data} = useGetAccountResources(address);

  if (isLoading || error || !data) {
    return null;
  }

  return (
    <ResultLink
      key={`al-${address}`}
      to={`/account/${address}`}
      text={`Account ${address}`}
    />
  );
}
