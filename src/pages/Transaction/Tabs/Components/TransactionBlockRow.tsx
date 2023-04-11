import {Link} from "@mui/material";
import * as React from "react";
import {useGetBlockByVersion} from "../../../../api/hooks/useGetBlock";
import ContentRow from "../../../../components/IndividualPageContent/ContentRow";
import {getLearnMoreTooltip} from "../../helpers";
import {InternalLink} from "../../../../routing";

export default function TransactionBlockRow({version}: {version: string}) {
  const {data} = useGetBlockByVersion({version: parseInt(version)});

  if (!data) {
    return null;
  }

  return (
    <ContentRow
      title="Block:"
      value={
        <InternalLink to={`/block/${data.block_height}`} underline="none">
          {data.block_height}
        </InternalLink>
      }
      tooltip={getLearnMoreTooltip("block_height")}
    />
  );
}
