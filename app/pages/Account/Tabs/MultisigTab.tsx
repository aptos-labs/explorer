import {Box, Stack, Typography, useTheme} from "@mui/material";
import type React from "react";
import type {Types} from "~/types/aptos";
import HashButton, {HashType} from "../../../components/HashButton";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import JsonViewCard from "../../../components/IndividualPageContent/JsonViewCard";
import {useTranslation} from "../../../i18n";

const MULTISIG_ACCOUNT_RESOURCE = "0x1::multisig_account::MultisigAccount";

interface MultisigAccountData {
  add_owners_events: {
    counter: string;
    guid: {
      id: {
        addr: string;
        creation_num: string;
      };
    };
  };
  create_transaction_events: {
    counter: string;
    guid: {
      id: {
        addr: string;
        creation_num: string;
      };
    };
  };
  execute_rejected_transaction_events: {
    counter: string;
    guid: {
      id: {
        addr: string;
        creation_num: string;
      };
    };
  };
  execute_transaction_events: {
    counter: string;
    guid: {
      id: {
        addr: string;
        creation_num: string;
      };
    };
  };
  metadata: {
    inner: string;
  };
  next_sequence_number: string;
  num_signatures_required: string;
  owners: string[];
  remove_owners_events: {
    counter: string;
    guid: {
      id: {
        addr: string;
        creation_num: string;
      };
    };
  };
  signer_cap: {
    account: string;
  };
  transactions: {
    inner: {
      data: Array<{
        key: string;
        value: {
          creation_time_secs: string;
          creator: string;
          payload: {
            vec: string[];
          };
          votes: {
            data: Array<{
              key: string;
              value: boolean;
            }>;
          };
        };
      }>;
    };
  };
  update_signatures_required_events: {
    counter: string;
    guid: {
      id: {
        addr: string;
        creation_num: string;
      };
    };
  };
  vote_events: {
    counter: string;
    guid: {
      id: {
        addr: string;
        creation_num: string;
      };
    };
  };
}

function MultisigContent({
  multisigResource,
}: {
  multisigResource: Types.MoveResource;
}): React.JSX.Element {
  const {t, formatInteger, formatDateTime} = useTranslation();
  const theme = useTheme();
  const multisigData: MultisigAccountData =
    multisigResource.data as MultisigAccountData; // Use any for now to handle unknown structure

  // Helper function to safely get nested value
  function safeGet(
    obj: unknown,
    path: string,
    defaultValue: string | number = "N/A",
  ): string | number {
    return path.split(".").reduce((current, key) => {
      return current &&
        typeof current === "object" &&
        current !== null &&
        key in current &&
        current[key as keyof typeof current] !== undefined
        ? (current[key as keyof typeof current] as unknown)
        : defaultValue;
    }, obj as unknown) as string | number;
  }

  return (
    <ContentBox>
      <ContentRow
        titleKey="fields.resourceType"
        value={
          <Typography variant="body1" sx={{fontFamily: "monospace"}}>
            {multisigResource.type}
          </Typography>
        }
      />
      <ContentRow
        titleKey="fields.requiredSignatures"
        value={safeGet(multisigData, "num_signatures_required")}
      />
      <ContentRow
        titleKey="fields.nextSequenceNumber"
        value={safeGet(multisigData, "next_sequence_number")}
      />
      {multisigData.owners && Array.isArray(multisigData.owners) && (
        <Box sx={{mt: 2, mb: 2}}>
          <Typography variant="h6" sx={{mb: 1}}>
            {t("multisig.ownersTitle", {
              count: formatInteger(multisigData.owners.length),
            })}
          </Typography>
          {multisigData.owners.map((owner: string, index: number) => (
            <Stack
              key={owner}
              direction="row"
              spacing={2}
              sx={{
                alignItems: "center",
                mb: 1,
                p: 1.5,
                borderRadius: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: "primary",
                  minWidth: "20px",
                  textAlign: "center",
                }}
              >
                {index + 1}
              </Typography>
              <Box sx={{flexGrow: 1}}>
                <HashButton hash={owner} type={HashType.ACCOUNT} size="large" />
              </Box>
            </Stack>
          ))}
        </Box>
      )}
      {/* Check for pending transactions - try different possible structures */}
      {(() => {
        // Access transactions directly from typed data structure
        const transactions =
          multisigData.transactions?.inner?.data ||
          (multisigData.transactions as unknown as {data?: unknown[]})?.data ||
          (multisigData.transactions as unknown as unknown[]);

        if (
          transactions &&
          Array.isArray(transactions) &&
          transactions.length > 0
        ) {
          return (
            <Box sx={{mt: 2, mb: 2}}>
              <Typography variant="h6" sx={{mb: 1}}>
                {t("multisig.pendingTitle", {
                  count: formatInteger(transactions.length),
                })}
              </Typography>
              {transactions.map(
                (
                  tx: {
                    key?: string;
                    value?: {
                      creator?: string;
                      creation_time_secs?: string;
                      votes?: {
                        data?: Array<{
                          key?: string;
                          value?: boolean;
                        }>;
                      };
                    };
                  },
                  index: number,
                ) => (
                  <Box
                    key={tx.key ?? `tx-${index}`}
                    sx={{
                      mb: 2,
                      p: 2,
                      backgroundColor: theme.palette.background.paper,
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{mb: 1}}>
                      {t("multisig.transactionId", {
                        id:
                          tx.key ||
                          t("multisig.transactionN", {n: String(index + 1)}),
                      })}
                    </Typography>
                    {tx.value && (
                      <>
                        <Typography variant="body2" sx={{mb: 1}}>
                          {t("multisig.creatorLabel")}{" "}
                          <code>{tx.value.creator || t("common.unknown")}</code>
                        </Typography>
                        {tx.value.creation_time_secs && (
                          <Typography variant="body2" sx={{mb: 1}}>
                            {t("multisig.creationTime")}{" "}
                            {formatDateTime(
                              new Date(
                                parseInt(tx.value.creation_time_secs, 10) *
                                  1000,
                              ),
                            )}
                          </Typography>
                        )}
                        {tx.value.votes?.data && (
                          <>
                            <Typography variant="body2" sx={{mb: 1}}>
                              {t("multisig.votesRequired", {
                                count: formatInteger(
                                  tx.value.votes.data.length,
                                ),
                                required: String(
                                  safeGet(
                                    multisigData,
                                    "num_signatures_required",
                                    "?",
                                  ),
                                ),
                              })}
                            </Typography>
                            {tx.value.votes.data.map(
                              (
                                vote: {
                                  key?: string;
                                  value?: boolean;
                                },
                                voteIndex: number,
                              ) => (
                                <Typography
                                  key={vote.key ?? `vote-${voteIndex}`}
                                  variant="body2"
                                  sx={{
                                    ml: 2,
                                    fontFamily: "monospace",
                                    color: vote.value ? "green" : "red",
                                  }}
                                >
                                  {vote.key}:{" "}
                                  {vote.value
                                    ? t("multisig.voteApproved")
                                    : t("multisig.voteRejected")}
                                </Typography>
                              ),
                            )}
                          </>
                        )}
                      </>
                    )}
                  </Box>
                ),
              )}
            </Box>
          );
        }
        return null;
      })()}
      <Box sx={{mt: 3}}>
        <Typography variant="h6" sx={{mb: 2}}>
          {t("multisig.eventCounters")}
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 2,
          }}
        >
          <ContentRow
            titleKey="fields.transactionsCreated"
            value={safeGet(multisigData, "create_transaction_events.counter")}
          />
          <ContentRow
            titleKey="fields.transactionsExecuted"
            value={safeGet(multisigData, "execute_transaction_events.counter")}
          />
          <ContentRow
            titleKey="fields.rejectedTransactionsExecuted"
            value={safeGet(
              multisigData,
              "execute_rejected_transaction_events.counter",
            )}
          />
          <ContentRow
            titleKey="fields.votesCast"
            value={safeGet(multisigData, "vote_events.counter")}
          />
          <ContentRow
            titleKey="fields.ownersAdded"
            value={safeGet(multisigData, "add_owners_events.counter")}
          />
          <ContentRow
            titleKey="fields.ownersRemoved"
            value={safeGet(multisigData, "remove_owners_events.counter")}
          />
          <ContentRow
            titleKey="fields.signaturesRequiredUpdated"
            value={safeGet(
              multisigData,
              "update_signatures_required_events.counter",
            )}
          />
        </Box>
      </Box>
      <Box sx={{mt: 3}}>
        <Typography variant="h6" sx={{mb: 2}}>
          {t("multisig.rawData")}
        </Typography>
        <JsonViewCard data={multisigData} />
      </Box>
    </ContentBox>
  );
}

type MultisigTabProps = {
  resourceData: Types.MoveResource[] | undefined;
};

export default function MultisigTab({resourceData}: MultisigTabProps) {
  const {t} = useTranslation();
  const multisigResource = resourceData?.find(
    (resource) => resource.type === MULTISIG_ACCOUNT_RESOURCE,
  );

  if (!multisigResource) {
    return (
      <ContentBox>
        <Typography variant="body1" color="textSecondary">
          {t("multisig.noResource")}
        </Typography>
      </ContentBox>
    );
  }

  return <MultisigContent multisigResource={multisigResource} />;
}
