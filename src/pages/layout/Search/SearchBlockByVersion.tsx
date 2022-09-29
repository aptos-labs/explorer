import React from "react";
import ResultLink from "./ResultLink";
import {useGetBlockByVersion} from "../../../api/hooks/useGetBlock";

type SearchBlockByVersionProps = {
  version: string;
};

export default function SearchBlockByVersion({
  version,
}: SearchBlockByVersionProps) {
  const {isLoading, isError, data} = useGetBlockByVersion(parseInt(version));

  if (isLoading || isError || !data) {
    return null;
  }

  return (
    <ResultLink
      key={`block-version-${version}`}
      to={`/block/${data.block_height}`}
      text={`Block with Txn Version ${version}`}
    />
  );
}
