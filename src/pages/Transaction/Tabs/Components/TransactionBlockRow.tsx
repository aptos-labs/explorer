import {Link} from "@mui/material";
import * as React from "react";
import {useGetBlockByVersion} from "../../../../api/hooks/useGetBlock";
import ContentRow from "../../../../components/IndividualPageContent/ContentRow";
import {getLearnMoreTooltip} from "../../helpers";

export default function TransactionBlockRow({version}: {version: string}) {
  const {data} = useGetBlockByVersion({version: parseInt(version)});

  if (!data) {
    return null;
  }

  return (
    <ContentRow
      title="Block:"
      value={
        <Link href={`/block/${data.block_height}`} underline="none">
          {data.block_height}
        </Link>
      }
      tooltip={getLearnMoreTooltip("block_height")}
    />
  );
}
