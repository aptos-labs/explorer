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
import type {Types} from "~/types/aptos";
import {useSentioCallTrace} from "../../../api/hooks/useSentioCallTrace";
import {useTranslation} from "../../../i18n";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import JsonViewCard from "../../../components/IndividualPageContent/JsonViewCard";
import {TransactionTypeName} from "../../../components/TransactionType";
import {useNetworkName} from "../../../global-config/GlobalConfig";
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
  const {t} = useTranslation();
  const networkName = useNetworkName();
  const isUser = transaction.type === TransactionTypeName.User;
  const txFailed =
    "success" in transaction &&
    (transaction as {success: boolean}).success === false;
  const vmStatus =
    "vm_status" in transaction
      ? (transaction as {vm_status: string}).vm_status
      : undefined;
  const supported = getSentioCallTraceNetworkId(networkName) !== undefined;
  const [rawExpanded, setRawExpanded] = useState(false);

  const traceQuery = useSentioCallTrace({
    networkName,
    txHash: isUser ? transaction.hash : "",
    enabled: supported && isUser,
  });

  if (!isUser) {
    return (
      <Box
        sx={{
          marginBottom: 3,
        }}
      >
        <ContentBox sx={{padding: {xs: 2, sm: 4}}}>
          <Typography
            sx={{
              color: "text.secondary",
            }}
          >
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
    <Box
      sx={{
        marginBottom: 3,
      }}
    >
      <ContentBox sx={{padding: {xs: 2, sm: 4}}}>
        <Stack spacing={2}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
            }}
          >
            {t("trace.title")}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
            }}
          >
            {t("trace.body")}
          </Typography>
          {viewerUrl ? (
            <SentioTraceExternalLink
              href={viewerUrl}
              label={t("trace.openSentio")}
            />
          ) : null}
          {!supported ? (
            <Alert severity="info">{t("trace.mainnetOnly")}</Alert>
          ) : traceQuery.isPending ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                py: 4,
              }}
            >
              <CircularProgress />
            </Box>
          ) : traceQuery.isError ? (
            <Alert severity="warning">
              {traceQuery.error instanceof Error
                ? traceQuery.error.message
                : t("trace.failedLoad")}
            </Alert>
          ) : traceQuery.isSuccess ? (
            isSentioCallTraceNode(traceQuery.data) ? (
              <Stack spacing={2}>
                {txFailed && (
                  <Alert severity="error">
                    {t("trace.txnFailed", {
                      detail: vmStatus ? `: ${vmStatus}` : "",
                    })}
                  </Alert>
                )}
                <CallTraceGraph root={traceQuery.data} txFailed={txFailed} />
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
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                      }}
                    >
                      {t("trace.rawJson")}
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
                {t("trace.unexpectedShape")}
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
