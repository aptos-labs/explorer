import {Box, Chip, Stack, Typography, useTheme} from "@mui/material";
import type {
  Types,
  WriteSetChange,
  WriteSetChange_DeleteTableItem,
  WriteSetChange_WriteTableItem,
} from "~/types/aptos";
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
 * Scans resource changes to find accounts whose resource data references
 * the given table handle, indicating they hold the table.
 */
function findEnclosingAccounts(
  handle: string,
  changes: WriteSetChange[],
): Array<{address: string; resourceType: string}> {
  const results: Array<{address: string; resourceType: string}> = [];
  const seen = new Set<string>();

  for (const change of changes) {
    if (
      (change.type === "write_resource" || change.type === "create_resource") &&
      change.data
    ) {
      const dataStr = JSON.stringify(change.data);
      if (dataStr.includes(handle)) {
        const key = `${change.address}::${change.data.type}`;
        if (!seen.has(key)) {
          seen.add(key);
          results.push({
            address: change.address,
            resourceType: change.data.type,
          });
        }
      }
    }
  }

  return results;
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
    try {
      const parsed = JSON.parse(val);
      if (typeof parsed === "object" && parsed !== null) {
        return {isComplex: true, value: parsed};
      }
      return {isComplex: false, value: parsed};
    } catch {
      return {isComplex: false, value: val};
    }
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
  allChanges,
}: {
  change: TableItemChange;
  allChanges: WriteSetChange[];
}) {
  const theme = useTheme();
  const enclosingAccounts = findEnclosingAccounts(change.handle, allChanges);
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

          {isWriteTableItem(change) && change.data && (
            <>
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
              <ContentRow
                title="Value (Decoded):"
                value={<DecodedValueDisplay value={change.data.value} />}
              />
            </>
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
            <TableItemDetails change={change} allChanges={changes} />
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
