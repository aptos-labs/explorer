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
import {
  collectionV2Address,
  objectCoreResource,
  tokenV2Address,
} from "../../../constants";

type ChangesTabProps = {
  transaction: Types.Transaction;
};

// Helper to determine if a change is a WriteTableItem
function isWriteTableItem(
  change: Types.WriteSetChange,
): change is Types.WriteSetChange & {
  type: "write_table_item";
  handle: string;
  key: string;
  value: string;
  data?: {
    key: unknown;
    key_type: string;
    value: unknown;
    value_type: string;
  };
} {
  return change.type === "write_table_item";
}

// Helper to determine if a change is a DeleteTableItem
function isDeleteTableItem(
  change: Types.WriteSetChange,
): change is Types.WriteSetChange & {
  type: "delete_table_item";
  handle: string;
  key: string;
  data?: {
    key: unknown;
    key_type: string;
  };
} {
  return change.type === "delete_table_item";
}

// Helper to find potential account addresses that might contain a table handle
function findPotentialAccountsForTableHandle(
  changes: Types.WriteSetChange[],
  tableHandle: string,
): string[] {
  const accounts = new Set<string>();

  for (const change of changes) {
    // Check write_resource changes for table handles in their data
    if (change.type === "write_resource" && "address" in change) {
      if ("data" in change && change.data) {
        const dataStr = JSON.stringify(change.data);
        if (dataStr.includes(tableHandle)) {
          accounts.add(change.address);
        }
      }
    }
  }

  return Array.from(accounts);
}

function TableHandleInfo({potentialAccounts}: {potentialAccounts: string[]}) {
  if (potentialAccounts.length === 0) {
    return null;
  }

  return (
    <Box sx={{mt: 1, p: 1, backgroundColor: "action.hover", borderRadius: 1}}>
      <Typography variant="caption" color="text.secondary">
        Potential enclosing resource
        {potentialAccounts.length > 1 ? "s" : ""}:
      </Typography>
      {potentialAccounts.map((account, idx) => (
        <Box key={idx} sx={{mt: 0.5}}>
          <HashButton hash={account} type={HashType.ACCOUNT} />
        </Box>
      ))}
      <Typography variant="caption" color="text.secondary" sx={{mt: 0.5}}>
        (Visit the account page and check Resources tab to find the exact
        resource containing this table handle)
      </Typography>
    </Box>
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
        // Special handling for table item changes
        const isTableWrite = isWriteTableItem(change);
        const isTableDelete = isDeleteTableItem(change);
        const isTableChange = isTableWrite || isTableDelete;

        // Find potential accounts for table changes
        const potentialAccounts = isTableChange
          ? findPotentialAccountsForTableHandle(changes, change.handle)
          : [];

        return (
          <CollapsibleCard
            key={i}
            titleKey="Index:"
            titleValue={i.toString()}
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
            {"data" in change && change.data && !isTableChange && (
              <ContentRow
                title="Data:"
                value={<JsonViewCard data={change.data} />}
              />
            )}
            {"handle" in change && (
              <>
                <ContentRow title="Table Handle:" value={change.handle} />
                <TableHandleInfo potentialAccounts={potentialAccounts} />
              </>
            )}
            {/* For table items, show decoded key/value if available, otherwise show hex */}
            {"key" in change && (
              <ContentRow
                title={isTableChange ? "Key (Type):" : "Key:"}
                value={
                  isTableChange && change.data && "key" in change.data ? (
                    <>
                      <JsonViewCard data={change.data.key} />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{mt: 1, display: "block"}}
                      >
                        Type: {change.data.key_type}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{mt: 0.5, display: "block"}}
                      >
                        Hex: {change.key}
                      </Typography>
                    </>
                  ) : (
                    change.key
                  )
                }
              />
            )}
            {"value" in change && (
              <ContentRow
                title={isTableWrite ? "Value (Type):" : "Value:"}
                value={
                  isTableWrite && change.data && "value" in change.data ? (
                    <>
                      <JsonViewCard data={change.data.value} />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{mt: 1, display: "block"}}
                      >
                        Type: {change.data.value_type}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{mt: 0.5, display: "block"}}
                      >
                        Hex: {change.value}
                      </Typography>
                    </>
                  ) : (
                    change.value
                  )
                }
              />
            )}
          </CollapsibleCard>
        );
      })}
    </CollapsibleCards>
  );
}
