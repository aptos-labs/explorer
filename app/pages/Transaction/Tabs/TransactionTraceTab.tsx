import {Alert, Box, CircularProgress, Stack, Typography} from "@mui/material";
import type React from "react";
import {useSentioCallTrace} from "../../../api/hooks/useSentioCallTrace";
import {TransactionTypeName} from "../../../components/TransactionType";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import JsonViewCard from "../../../components/IndividualPageContent/JsonViewCard";
import {useNetworkName} from "../../../global-config/GlobalConfig";
import type {Types} from "~/types/aptos";
import {
  getSentioCallTraceNetworkId,
  getSentioTransactionTraceViewerUrl,
  isSentioCallTraceNode,
} from "../../../utils/sentioCallTrace";
import CallTraceGraph, {SentioTraceExternalLink} from "./CallTraceGraph";

type TransactionTraceTabProps = {
  transaction: Types.Transaction;
};

export default function TransactionTraceTab({
  transaction,
}: TransactionTraceTabProps): React.JSX.Element {
  const networkName = useNetworkName();
  const isUser = transaction.type === TransactionTypeName.User;
  const supported = getSentioCallTraceNetworkId(networkName) !== undefined;

  const traceQuery = useSentioCallTrace({
    networkName,
    txHash: isUser ? transaction.hash : "",
    enabled: supported && isUser,
  });

  if (!isUser) {
    return (
      <Box marginBottom={3}>
        <ContentBox padding={4}>
          <Typography color="text.secondary">
            Call trace is only available for user transactions.
          </Typography>
        </ContentBox>
      </Box>
    );
  }

  const viewerUrl = getSentioTransactionTraceViewerUrl(
    networkName,
    transaction.hash,
  );

  return (
    <Box marginBottom={3}>
      <ContentBox padding={4}>
        <Stack spacing={2}>
          <Typography variant="body1" fontWeight={600}>
            Move call trace
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Execution tree from Sentio’s traced fullnode (experimental). Links
            go to this explorer: callee account and the module Run / Code tabs.
          </Typography>
          {viewerUrl ? (
            <SentioTraceExternalLink
              href={viewerUrl}
              label="Open Sentio’s interactive trace viewer"
            />
          ) : null}
          {!supported ? (
            <Alert severity="info">
              Call traces are only fetched for Aptos mainnet in this build.
            </Alert>
          ) : traceQuery.isPending ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : traceQuery.isError ? (
            <Alert severity="warning">
              {traceQuery.error instanceof Error
                ? traceQuery.error.message
                : "Failed to load trace."}
            </Alert>
          ) : traceQuery.isSuccess ? (
            isSentioCallTraceNode(traceQuery.data) ? (
              <Stack spacing={3}>
                <CallTraceGraph root={traceQuery.data} />
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{display: "block", mb: 1}}
                  >
                    Raw response
                  </Typography>
                  <JsonViewCard data={traceQuery.data} collapsedByDefault />
                </Box>
              </Stack>
            ) : (
              <Alert severity="warning">
                Trace response had an unexpected shape; showing raw JSON only.
                <Box sx={{mt: 2}}>
                  <JsonViewCard data={traceQuery.data} collapsedByDefault />
                </Box>
              </Alert>
            )
          ) : null}
        </Stack>
      </ContentBox>
    </Box>
  );
}
