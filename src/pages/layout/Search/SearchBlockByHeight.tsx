import React from "react";
import ResultLink from "./ResultLink";
import {useGetBlockByHeight} from "../../../api/hooks/useGetBlock";

type SearchBlockByHeightProps = {
  height: string;
};

export default function SearchBlockByHeight({
  height,
}: SearchBlockByHeightProps) {
  const {isLoading, isError, data} = useGetBlockByHeight(parseInt(height));

  if (isLoading || isError || !data) {
    return null;
  }

  return (
    <ResultLink
      key={`block-height-${height}`}
      to={`/block/${height}`}
      text={`Block ${height}`}
    />
  );
}
