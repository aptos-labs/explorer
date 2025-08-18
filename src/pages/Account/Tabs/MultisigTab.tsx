import {Types} from "aptos";
import React from "react";
import {Box, Typography, Stack} from "@mui/material";
import JsonViewCard from "../../../components/IndividualPageContent/JsonViewCard";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import {grey} from "../../../themes/colors/aptosColorPalette";
import HashButton, {HashType} from "../../../components/HashButton";

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
  const multisigData: MultisigAccountData =
    multisigResource.data as MultisigAccountData; // Use any for now to handle unknown structure

  // Helper function to safely get nested value
  function safeGet(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    obj: any | undefined,
    path: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultValue: any = "N/A",
  ) {
    return path.split(".").reduce((current, key) => {
      return current && current[key] !== undefined
        ? current[key]
        : defaultValue;
    }, obj);
  }

  return (
    <ContentBox>
      <ContentRow
        title="Resource Type:"
        value={
          <Typography variant="body1" sx={{fontFamily: "monospace"}}>
            {multisigResource.type}
          </Typography>
        }
      />

      <ContentRow
        title="Required Signatures:"
        value={safeGet(multisigData, "num_signatures_required")}
      />

      <ContentRow
        title="Next Sequence Number:"
        value={safeGet(multisigData, "next_sequence_number")}
      />

      {multisigData.owners && Array.isArray(multisigData.owners) && (
        <Box sx={{mt: 2, mb: 2}}>
          <Typography variant="h6" sx={{mb: 1}}>
            Owners ({multisigData.owners.length})
          </Typography>
          {multisigData.owners.map((owner: string, index: number) => (
            <Stack
              key={index}
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{
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
        const transactions =
          safeGet(multisigData, "transactions.inner.data", null) ||
          safeGet(multisigData, "transactions.data", null) ||
          safeGet(multisigData, "transactions", null);

        if (
          transactions &&
          Array.isArray(transactions) &&
          transactions.length > 0
        ) {
          return (
            <Box sx={{mt: 2, mb: 2}}>
              <Typography variant="h6" sx={{mb: 1}}>
                Pending Transactions ({transactions.length})
              </Typography>
              {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                transactions.map((tx: any, index: number) => (
                  <Box
                    key={index}
                    sx={{
                      mb: 2,
                      p: 2,
                      backgroundColor: grey[50],
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{mb: 1}}>
                      Transaction ID: {tx.key || `Transaction ${index + 1}`}
                    </Typography>
                    {tx.value && (
                      <>
                        <Typography variant="body2" sx={{mb: 1}}>
                          Creator: <code>{tx.value.creator || "Unknown"}</code>
                        </Typography>
                        {tx.value.creation_time_secs && (
                          <Typography variant="body2" sx={{mb: 1}}>
                            Creation Time:{" "}
                            {new Date(
                              parseInt(tx.value.creation_time_secs) * 1000,
                            ).toLocaleString()}
                          </Typography>
                        )}
                        {tx.value.votes && tx.value.votes.data && (
                          <>
                            <Typography variant="body2" sx={{mb: 1}}>
                              Votes: {tx.value.votes.data.length} /{" "}
                              {safeGet(
                                multisigData,
                                "num_signatures_required",
                                "?",
                              )}{" "}
                              required
                            </Typography>
                            {tx.value.votes.data.map(
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              (vote: any, voteIndex: number) => (
                                <Typography
                                  key={voteIndex}
                                  variant="body2"
                                  sx={{
                                    ml: 2,
                                    fontFamily: "monospace",
                                    color: vote.value ? "green" : "red",
                                  }}
                                >
                                  {vote.key}:{" "}
                                  {vote.value ? "✓ Approved" : "✗ Rejected"}
                                </Typography>
                              ),
                            )}
                          </>
                        )}
                      </>
                    )}
                  </Box>
                ))
              }
            </Box>
          );
        }
        return null;
      })()}

      <Box sx={{mt: 3}}>
        <Typography variant="h6" sx={{mb: 2}}>
          Event Counters
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 2,
          }}
        >
          <ContentRow
            title="Transactions Created:"
            value={safeGet(multisigData, "create_transaction_events.counter")}
          />
          <ContentRow
            title="Transactions Executed:"
            value={safeGet(multisigData, "execute_transaction_events.counter")}
          />
          <ContentRow
            title="Rejected Transactions Executed:"
            value={safeGet(
              multisigData,
              "execute_rejected_transaction_events.counter",
            )}
          />
          <ContentRow
            title="Votes Cast:"
            value={safeGet(multisigData, "vote_events.counter")}
          />
          <ContentRow
            title="Owners Added:"
            value={safeGet(multisigData, "add_owners_events.counter")}
          />
          <ContentRow
            title="Owners Removed:"
            value={safeGet(multisigData, "remove_owners_events.counter")}
          />
          <ContentRow
            title="Signatures Required Updated:"
            value={safeGet(
              multisigData,
              "update_signatures_required_events.counter",
            )}
          />
        </Box>
      </Box>

      <Box sx={{mt: 3}}>
        <Typography variant="h6" sx={{mb: 2}}>
          Raw Multisig Data
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
  const multisigResource = resourceData?.find(
    (resource) => resource.type === MULTISIG_ACCOUNT_RESOURCE,
  );

  if (!multisigResource) {
    return (
      <ContentBox>
        <Typography variant="body1" color="textSecondary">
          This account does not have a multisig resource.
        </Typography>
      </ContentBox>
    );
  }

  return <MultisigContent multisigResource={multisigResource} />;
}
