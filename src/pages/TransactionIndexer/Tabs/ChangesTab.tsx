import CollapsibleCards from "../../../components/IndividualPageContent/CollapsibleCards";
import useExpandedList from "../../../components/hooks/useExpandedList";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import CollapsibleCard from "../../../components/IndividualPageContent/CollapsibleCard";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import HashButton, {HashType} from "../../../components/HashButton";
import JsonViewCard from "../../../components/IndividualPageContent/JsonViewCard";
import {
  Block_Metadata_Transaction,
  Genesis_Transaction,
  User_Transaction,
  WriteSetChangesModule,
  WriteSetChangesResource,
  WriteSetChangesTable,
} from "../../../gql/graphql";

type ChangesTabProps = {
  transaction:
    | User_Transaction
    | Block_Metadata_Transaction
    | Genesis_Transaction;
};

export default function ChangesTab({transaction}: ChangesTabProps) {
  const modules: WriteSetChangesModule[] = transaction.write_set_changes_module;
  const tables: WriteSetChangesTable[] = transaction.write_set_changes_table;
  const resources: WriteSetChangesResource[] =
    transaction.write_set_changes_resource;
  const changes: (
    | WriteSetChangesModule
    | WriteSetChangesTable
    | WriteSetChangesResource
  )[] = [...modules, ...tables, ...resources];
  changes.sort((a, b) => a.index - b.index);

  const {expandedList, toggleExpandedAt, expandAll, collapseAll} =
    useExpandedList(changes.length);

  if (changes.length === 0) {
    return <EmptyTabContent />;
  }

  return (
    <CollapsibleCards
      expandedList={expandedList}
      expandAll={expandAll}
      collapseAll={collapseAll}
    >
      {changes.map((change, i) => (
        <CollapsibleCard
          key={i}
          titleKey="Index:"
          titleValue={i.toString()}
          expanded={expandedList[i]}
          toggleExpanded={() => toggleExpandedAt(i)}
        >
          <ContentRow title="Type:" value={change.write_set_change_type} />
          {"address" in change && (
            <ContentRow
              title="Address:"
              value={
                <HashButton hash={change.address} type={HashType.ACCOUNT} />
              }
            />
          )}
          {"hash" in change && (
            <ContentRow title="State Key Hash:" value={change.hash} />
          )}
          {"data" in change && change.data && (
            <ContentRow
              title="Data:"
              value={<JsonViewCard data={change.data} />}
            />
          )}
          {"table_handle" in change && (
            <ContentRow title="Handle:" value={change.table_handle} />
          )}
          {"key" in change && <ContentRow title="Key:" value={change.key} />}
          {"decoded_value" in change && (
            <ContentRow title="Value:" value={change.decoded_value} />
          )}
        </CollapsibleCard>
      ))}
    </CollapsibleCards>
  );
}
