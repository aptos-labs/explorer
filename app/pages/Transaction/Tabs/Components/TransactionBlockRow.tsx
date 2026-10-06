import {Skeleton} from "@mui/material";
import {useGetBlockByVersion} from "../../../../api/hooks/useGetBlock";
import ContentRow from "../../../../components/IndividualPageContent/ContentRow";
import IntegerValue from "../../../../components/IndividualPageContent/ContentValue/IntegerValue";
import {getLearnMoreTooltip} from "../../helpers";

export default function TransactionBlockRow({version}: {version: string}) {
  const {data, isPending} = useGetBlockByVersion({
    version: parseInt(version, 10),
  });

  if (isPending) {
    return (
      <ContentRow
        titleKey="fields.block"
        value={<Skeleton width={96} />}
        tooltip={getLearnMoreTooltip("block_height")}
      />
    );
  }

  if (!data) {
    return null;
  }

  return (
    <ContentRow
      titleKey="fields.block"
      value={
        <IntegerValue
          value={data.block_height}
          copyable
          to={`/block/${data.block_height}`}
        />
      }
      tooltip={getLearnMoreTooltip("block_height")}
    />
  );
}
