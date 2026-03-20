import {Box, Chip, Stack, Typography, useTheme} from "@mui/material";
import {useMemo} from "react";
import type {
  Types,
  WriteSetChange,
  WriteSetChange_DeleteTableItem,
  WriteSetChange_WriteTableItem,
} from "~/types/aptos";
import {
  useGetTableItemsData,
  useGetTableItemsMetadata,
} from "../../../api/hooks/useGetTableItemData";
import HashButton, {HashType} from "../../../components/HashButton";
import useExpandedList from "../../../components/hooks/useExpandedList";
import CollapsibleCard from "../../../components/IndividualPageContent/CollapsibleCard";
import CollapsibleCards from "../../../components/IndividualPageContent/CollapsibleCards";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import JsonViewCard from "../../../components/IndividualPageContent/JsonViewCard";
import {
  collectionV2Address,
  objectCoreResource,
  tokenV2Address,
} from "../../../constants";

type ChangesTabProps = {
  transaction: Types.Transaction;
};

function getChangeTitleValue(
  change: Types.WriteSetChange,
  index: number,
): string {
  const parts = [index.toString(), change.type];

  if ("address" in change) {
    parts.push(change.address);
  } else if ("handle" in change) {
    parts.push(change.handle);
  }

  return parts.join(" — ");
}

type TableItemChange =
  | WriteSetChange_WriteTableItem
  | WriteSetChange_DeleteTableItem;

type EnclosingAccount = {address: string; resourceType: string};

function isTableItemChange(change: WriteSetChange): change is TableItemChange {
  return (
    change.type === "write_table_item" || change.type === "delete_table_item"
  );
}

function isWriteTableItem(
  change: TableItemChange,
): change is WriteSetChange_WriteTableItem {
  return change.type === "write_table_item";
}

/**
 * Builds a map from table handle → enclosing accounts by scanning all
 * resource changes once. This avoids repeated O(n) scans per table item.
 */
function buildHandleToAccountsIndex(
  changes: WriteSetChange[],
): Map<string, EnclosingAccount[]> {
  const handles = new Set<string>();
  for (const change of changes) {
    if (isTableItemChange(change)) {
      handles.add(change.handle);
    }
  }

  if (handles.size === 0) return new Map();

  const index = new Map<string, EnclosingAccount[]>();
  const seen = new Set<string>();

  for (const change of changes) {
    if (
      (change.type === "write_resource" || change.type === "create_resource") &&
      change.data
    ) {
      const dataStr = JSON.stringify(change.data);
      for (const handle of handles) {
        if (dataStr.includes(handle)) {
          const dedupeKey = `${handle}::${change.address}::${change.data.type}`;
          if (!seen.has(dedupeKey)) {
            seen.add(dedupeKey);
            const existing = index.get(handle) ?? [];
            existing.push({
              address: change.address,
              resourceType: change.data.type,
            });
            index.set(handle, existing);
          }
        }
      }
    }
  }

  return index;
}

/**
 * Determines whether a decoded value should be displayed with JsonViewCard
 * (for objects/arrays) or as plain text (for primitives).
 */
function prepareDisplayValue(val: unknown): {
  isComplex: boolean;
  value: unknown;
} {
  if (val === null || val === undefined) {
    return {isComplex: false, value: val};
  }

  if (typeof val === "object") {
    return {isComplex: true, value: val};
  }

  if (typeof val === "string") {
    const trimmed = val.trim();
    // Only attempt JSON parsing for strings that look like JSON
    // objects/arrays (start with "{" or "["). This avoids coercing
    // primitive-like strings (e.g. "123", "true") and preserves
    // large numeric strings as-is.
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed === "object" && parsed !== null) {
          return {isComplex: true, value: parsed};
        }
        return {isComplex: false, value: parsed};
      } catch {
        // Fall through to returning the original string below.
      }
    }

    return {isComplex: false, value: val};
  }

  return {isComplex: false, value: val};
}

function DecodedValueDisplay({value}: {value: unknown}) {
  const {isComplex, value: displayValue} = prepareDisplayValue(value);

  if (isComplex) {
    return <JsonViewCard data={displayValue} />;
  }

  return (
    <Typography
      variant="body2"
      sx={{
        fontFamily: "monospace",
        fontSize: "0.85rem",
        wordBreak: "break-all",
      }}
    >
      {String(displayValue)}
    </Typography>
  );
}

function TableItemDetails({
  change,
  enclosingAccounts,
  isEnriching = false,
}: {
  change: TableItemChange;
  enclosingAccounts: EnclosingAccount[];
  isEnriching?: boolean;
}) {
  const theme = useTheme();
  const hasDecodedData = !!change.data;
  const mutedColor = theme.palette.text.secondary;

  return (
    <>
      {enclosingAccounts.length > 0 && (
        <ContentRow
          title="Enclosing Account:"
          value={
            <Stack spacing={1}>
              {enclosingAccounts.map((account) => (
                <Stack
                  key={`${account.address}::${account.resourceType}`}
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  flexWrap="wrap"
                >
                  <HashButton hash={account.address} type={HashType.ACCOUNT} />
                  <Typography
                    variant="body2"
                    sx={{
                      color: mutedColor,
                      fontSize: "0.75rem",
                      fontFamily: "monospace",
                      wordBreak: "break-all",
                    }}
                  >
                    {account.resourceType}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          }
        />
      )}

      {isEnriching && !hasDecodedData && (
        <ContentRow
          title="Decoded Data:"
          value={
            <Typography
              variant="body2"
              sx={{color: mutedColor, fontStyle: "italic", fontSize: "0.85rem"}}
            >
              Loading decoded data from indexer…
            </Typography>
          }
        />
      )}

      {hasDecodedData && change.data && (
        <>
          <ContentRow
            title="Key Type:"
            value={
              <Chip
                label={change.data.key_type}
                size="small"
                variant="outlined"
                sx={{fontFamily: "monospace", fontSize: "0.75rem"}}
              />
            }
          />
          <ContentRow
            title="Key (Decoded):"
            value={<DecodedValueDisplay value={change.data.key} />}
          />

          {change.data.value_type && (
            <ContentRow
              title="Value Type:"
              value={
                <Chip
                  label={change.data.value_type}
                  size="small"
                  variant="outlined"
                  sx={{fontFamily: "monospace", fontSize: "0.75rem"}}
                />
              }
            />
          )}
          {change.data.value !== undefined && (
            <ContentRow
              title="Value (Decoded):"
              value={<DecodedValueDisplay value={change.data.value} />}
            />
          )}
        </>
      )}

      <ContentRow
        title={hasDecodedData ? "Key (Raw):" : "Key:"}
        value={
          <Box
            component="span"
            sx={{
              fontFamily: "monospace",
              fontSize: "0.75rem",
              color: hasDecodedData ? mutedColor : "inherit",
              wordBreak: "break-all",
            }}
          >
            {change.key}
          </Box>
        }
      />

      {isWriteTableItem(change) && (
        <ContentRow
          title={hasDecodedData ? "Value (Raw):" : "Value:"}
          value={
            <Box
              component="span"
              sx={{
                fontFamily: "monospace",
                fontSize: "0.75rem",
                color: hasDecodedData ? mutedColor : "inherit",
                wordBreak: "break-all",
              }}
            >
              {change.value}
            </Box>
          }
        />
      )}
    </>
  );
}

export default function ChangesTab({transaction}: ChangesTabProps) {
  const changes: Types.WriteSetChange[] =
    "changes" in transaction ? transaction.changes : [];

  const transactionVersion =
    "version" in transaction ? (transaction.version as string) : undefined;

  const tableHandles = useMemo(() => {
    const handles = new Set<string>();
    for (const change of changes) {
      if (isTableItemChange(change) && change.data == null) {
        handles.add(change.handle);
      }
    }
    return [...handles];
  }, [changes]);

  const hasUnenrichedTableItems = tableHandles.length > 0;

  const {data: tableItemsResponse, isLoading: isLoadingItems} =
    useGetTableItemsData(
      hasUnenrichedTableItems ? transactionVersion : undefined,
    );
  const {data: tableMetadataResponse, isLoading: isLoadingMetadata} =
    useGetTableItemsMetadata(hasUnenrichedTableItems ? tableHandles : []);

  const enrichedChanges = useMemo(() => {
    if (!tableItemsResponse || !tableMetadataResponse) return changes;

    const tableItems = tableItemsResponse.table_items ?? [];
    const tableMetadatas = tableMetadataResponse.table_metadatas ?? [];

    if (tableItems.length === 0 && tableMetadatas.length === 0) return changes;

    const metadataByHandle = new Map(tableMetadatas.map((m) => [m.handle, m]));
    const tableItemByIndex = new Map(
      tableItems.map((item) => [Number(item.write_set_change_index), item]),
    );

    return changes.map((change, i) => {
      if (!isTableItemChange(change) || change.data != null) return change;

      const indexerItem = tableItemByIndex.get(i);
      const metadata = metadataByHandle.get(change.handle);
      if (!indexerItem || !metadata) return change;

      if (isWriteTableItem(change)) {
        return {
          ...change,
          data: {
            key: indexerItem.decoded_key,
            key_type: metadata.key_type,
            value: indexerItem.decoded_value,
            value_type: metadata.value_type,
          },
        };
      }

      return {
        ...change,
        data: {
          key: indexerItem.decoded_key,
          key_type: metadata.key_type,
          value: indexerItem.decoded_value,
          value_type: metadata.value_type,
        },
      };
    });
  }, [changes, tableItemsResponse, tableMetadataResponse]);

  const isEnriching =
    hasUnenrichedTableItems && (isLoadingItems || isLoadingMetadata);

  const {expandedList, toggleExpandedAt, expandAll, collapseAll} =
    useExpandedList(enrichedChanges.length);

  const handleToAccounts = useMemo(
    () => buildHandleToAccountsIndex(enrichedChanges),
    [enrichedChanges],
  );

  if (enrichedChanges.length === 0) {
    return <EmptyTabContent />;
  }

  return (
    <CollapsibleCards
      expandedList={expandedList}
      expandAll={expandAll}
      collapseAll={collapseAll}
    >
      {enrichedChanges.map((change, i) => (
        <CollapsibleCard
          key={change.state_key_hash}
          titleKey="Index:"
          titleValue={getChangeTitleValue(change, i)}
          expanded={expandedList[i]}
          toggleExpanded={() => toggleExpandedAt(i)}
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
          {"data" in change && change.data && !isTableItemChange(change) && (
            <ContentRow
              title="Data:"
              value={<JsonViewCard data={change.data} />}
            />
          )}
          {"handle" in change && (
            <ContentRow title="Handle:" value={change.handle} />
          )}

          {isTableItemChange(change) && (
            <TableItemDetails
              change={change}
              enclosingAccounts={handleToAccounts.get(change.handle) ?? []}
              isEnriching={isEnriching && change.data == null}
            />
          )}

          {!isTableItemChange(change) && "key" in change && (
            <ContentRow title="Key:" value={(change as {key: string}).key} />
          )}
          {!isTableItemChange(change) && "value" in change && (
            <ContentRow
              title="Value:"
              value={(change as {value: string}).value}
            />
          )}
        </CollapsibleCard>
      ))}
    </CollapsibleCards>
  );
}
