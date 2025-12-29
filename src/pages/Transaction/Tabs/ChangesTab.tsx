import * as React from "react";
import {Types} from "aptos";
import {Box, Typography} from "@mui/material";
import CollapsibleCards from "../../../components/IndividualPageContent/CollapsibleCards";
import useExpandedList from "../../../components/hooks/useExpandedList";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import CollapsibleCard from "../../../components/IndividualPageContent/CollapsibleCard";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import HashButton, {HashType} from "../../../components/HashButton";
import JsonViewCard from "../../../components/IndividualPageContent/JsonViewCard";
import ParsedValue from "../../../components/TableItem/ParsedValue";
import {useGetTableItemABI} from "../../../api/hooks/useGetTableItemABI";
import {extractTableTypesFromResourceType} from "../../../utils/tableItemParsing";
import {
  collectionV2Address,
  objectCoreResource,
  tokenV2Address,
} from "../../../constants";

type ChangesTabProps = {
  transaction: Types.Transaction;
};

function TableItemChangeCard({
  change,
  index,
  expanded,
  toggleExpanded,
  isTableItemChange,
  resourceType,
  accountAddress,
}: {
  change: Types.WriteSetChange;
  index: number;
  expanded: boolean;
  toggleExpanded: () => void;
  isTableItemChange: boolean;
  resourceType?: string;
  accountAddress?: string;
}) {
  // Extract table types from resource type if available
  const tableTypes = resourceType
    ? extractTableTypesFromResourceType(resourceType)
    : null;
  const keyType = tableTypes?.keyType;
  const valueType = tableTypes?.valueType;

  // Fetch ABI if we have resource type info
  const {data: abi} = useGetTableItemABI(resourceType, accountAddress);

  // Type guard for table item change
  const tableItemChange =
    isTableItemChange &&
    "handle" in change &&
    "key" in change &&
    "value" in change
      ? (change as Types.WriteSetChange & {
          handle: string;
          key: unknown;
          value: unknown;
        })
      : null;

  return (
    <CollapsibleCard
      titleKey="Index:"
      titleValue={index.toString()}
      expanded={expanded}
      toggleExpanded={toggleExpanded}
    >
      <ContentRow title="Type:" value={change.type} />
      {"address" in change && (
        <ContentRow
          title="Address:"
          value={
            <HashButton
              hash={change.address}
              type={
                "data" in change &&
                "type" in change.data &&
                [
                  objectCoreResource,
                  tokenV2Address,
                  collectionV2Address,
                ].includes(change.data.type)
                  ? HashType.OBJECT
                  : HashType.ACCOUNT
              }
            />
          }
        />
      )}
      <ContentRow title="State Key Hash:" value={change.state_key_hash} />
      {"data" in change && change.data && "type" in change.data && (
        <ContentRow title="Resource:" value={change.data.type} />
      )}
      {"data" in change && change.data && (
        <ContentRow title="Data:" value={<JsonViewCard data={change.data} />} />
      )}
      {"handle" in change && (
        <ContentRow
          title="Handle:"
          value={
            <HashButton
              hash={change.handle}
              type={HashType.OTHERS}
              size="small"
            />
          }
        />
      )}
      {tableItemChange && (
        <>
          <Box sx={{mt: 2}}>
            <Typography variant="h6" sx={{mb: 1}}>
              Table Item Details
            </Typography>
            {keyType && (
              <Box sx={{mb: 1}}>
                <Typography
                  variant="body2"
                  sx={{color: "text.secondary", fontStyle: "italic"}}
                >
                  Key Type: {keyType}
                </Typography>
              </Box>
            )}
            {valueType && (
              <Box sx={{mb: 1}}>
                <Typography
                  variant="body2"
                  sx={{color: "text.secondary", fontStyle: "italic"}}
                >
                  Value Type: {valueType}
                </Typography>
              </Box>
            )}
            <Box sx={{mb: 2}}>
              <Typography variant="body2" sx={{mb: 0.5, fontWeight: 500}}>
                Key:
              </Typography>
              <ParsedValue
                value={tableItemChange.key}
                type={keyType}
                abi={abi}
                isKey={true}
              />
            </Box>
            <Box sx={{mb: 2}}>
              <Typography variant="body2" sx={{mb: 0.5, fontWeight: 500}}>
                Value:
              </Typography>
              <ParsedValue
                value={tableItemChange.value}
                type={valueType}
                abi={abi}
              />
            </Box>
          </Box>
        </>
      )}
      {!tableItemChange && (
        <>
          {"key" in change && (
            <ContentRow
              title="Key:"
              value={
                <JsonViewCard
                  data={(change as Types.WriteSetChange & {key: unknown}).key}
                />
              }
            />
          )}
          {"value" in change && (
            <ContentRow
              title="Value:"
              value={
                <JsonViewCard
                  data={
                    (change as Types.WriteSetChange & {value: unknown}).value
                  }
                />
              }
            />
          )}
        </>
      )}
    </CollapsibleCard>
  );
}

export default function ChangesTab({transaction}: ChangesTabProps) {
  const changes: Types.WriteSetChange[] =
    "changes" in transaction ? transaction.changes : [];

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
      {changes.map((change, i) => {
        // Check if this is a table item change
        const isTableItemChange =
          "handle" in change && "key" in change && "value" in change;

        // Try to get resource type for ABI lookup
        const resourceType =
          "data" in change && change.data && "type" in change.data
            ? change.data.type
            : undefined;

        // Get address for ABI lookup
        const accountAddress = "address" in change ? change.address : undefined;

        return (
          <TableItemChangeCard
            key={i}
            change={change}
            index={i}
            expanded={expandedList[i]}
            toggleExpanded={() => toggleExpandedAt(i)}
            isTableItemChange={isTableItemChange}
            resourceType={resourceType}
            accountAddress={accountAddress}
          />
        );
      })}
    </CollapsibleCards>
  );
}
