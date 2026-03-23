import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  CircularProgress,
  Link,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import type React from "react";
import {useState} from "react";
import {useSentioCallTrace} from "../../api/hooks/useSentioCallTrace";
import JsonViewCard from "../../components/IndividualPageContent/JsonViewCard";
import type {NetworkName} from "../../lib/constants";
import {
  getSentioCallTraceNetworkId,
  getSentioTransactionTraceViewerUrl,
} from "../../utils/sentioCallTrace";

type TransactionExperimentalCallTraceProps = {
  txHash: string;
  networkName: NetworkName;
};

export default function TransactionExperimentalCallTrace({
  txHash,
  networkName,
}: TransactionExperimentalCallTraceProps): React.JSX.Element {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const supported = getSentioCallTraceNetworkId(networkName) !== undefined;
  const traceQuery = useSentioCallTrace({
    networkName,
    txHash,
    enabled: expanded && supported,
  });

  const viewerUrl = getSentioTransactionTraceViewerUrl(networkName, txHash);

  const handleChange = (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded);
  };

  return (
    <Accordion
      expanded={expanded}
      onChange={handleChange}
      sx={{
        marginTop: 3,
        backgroundColor: theme.palette.background.paper,
        borderRadius: `${theme.shape.borderRadius}px !important`,
        "&:before": {
          display: "none",
        },
        "&.Mui-expanded": {
          margin: 0,
          marginTop: 3,
        },
      }}
      disableGutters
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          padding: 4,
          "& .MuiAccordionSummary-content": {
            margin: 0,
          },
        }}
      >
        <Typography
          variant="body1"
          sx={{color: theme.palette.text.secondary, fontWeight: 500}}
        >
          Experimental: Move call trace
        </Typography>
        <Typography
          component="span"
          variant="caption"
          sx={{
            alignSelf: "center",
            marginLeft: 1,
            color: theme.palette.text.disabled,
          }}
        >
          Sentio · hidden until expanded
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{padding: 4, paddingTop: 0}}>
        {expanded && (
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Third-party execution trace from Sentio (requires their traced
              fullnode). Data loads only after you open this section.
            </Typography>
            {viewerUrl ? (
              <Link
                href={viewerUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="body2"
              >
                Open interactive trace on Sentio
              </Link>
            ) : null}
            {!supported ? (
              <Typography variant="body2" color="text.secondary">
                Call traces are not available for this network in the explorer
                yet (Sentio integration is mainnet-only for now).
              </Typography>
            ) : (
              <>
                {traceQuery.isPending ? (
                  <Box display="flex" justifyContent="center" py={2}>
                    <CircularProgress size={28} />
                  </Box>
                ) : null}
                {traceQuery.isError ? (
                  <Alert severity="warning">
                    {traceQuery.error instanceof Error
                      ? traceQuery.error.message
                      : "Failed to load call trace."}
                  </Alert>
                ) : null}
                {traceQuery.isSuccess ? (
                  <JsonViewCard data={traceQuery.data} collapsedByDefault />
                ) : null}
              </>
            )}
          </Stack>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
