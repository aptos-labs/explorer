import {useGetBlockByVersion} from "../../../../api/hooks/useGetBlock";
import ContentRow from "../../../../components/IndividualPageContent/ContentRow";
import {Link} from "../../../../routing";
import {getLearnMoreTooltip} from "../../helpers";

export default function TransactionBlockRow({version}: {version: string}) {
  const {data} = useGetBlockByVersion({version: parseInt(version, 10)});

  if (!data) {
    return null;
  }

  return (
    <ContentRow
      title="Block:"
      value={
        <Link to={`/block/${data.block_height}`} underline="none">
          {data.block_height}
        </Link>
      }
      tooltip={getLearnMoreTooltip("block_height")}
    />
  );
}
