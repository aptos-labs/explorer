import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import type React from "react";
import {useState} from "react";
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
  const [rawExpanded, setRawExpanded] = useState(false);

  const traceQuery = useSentioCallTrace({
    networkName,
    txHash: isUser ? transaction.hash : "",
    enabled: supported && isUser,
  });

  if (!isUser) {
    return (
      <Box marginBottom={3}>
        <ContentBox padding={{xs: 2, sm: 4}}>
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
      <ContentBox padding={{xs: 2, sm: 4}}>
        <Stack spacing={2}>
          <Typography variant="body1" fontWeight={600}>
            Move call trace
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Execution tree from Sentio’s traced fullnode (experimental). Links
            open caller and callee accounts and the module Run tab in this
            explorer; Sentio’s viewer is linked below.
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
              <Stack spacing={2}>
                <CallTraceGraph root={traceQuery.data} />
                <Accordion
                  expanded={rawExpanded}
                  onChange={(_e, exp) => setRawExpanded(exp)}
                  disableGutters
                  elevation={0}
                  sx={{
                    border: (t) => `1px solid ${t.palette.divider}`,
                    borderRadius: 1,
                    "&:before": {display: "none"},
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body2" color="text.secondary">
                      Raw response (JSON)
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{pt: 0}}>
                    {rawExpanded ? (
                      <JsonViewCard data={traceQuery.data} collapsedByDefault />
                    ) : null}
                  </AccordionDetails>
                </Accordion>
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
