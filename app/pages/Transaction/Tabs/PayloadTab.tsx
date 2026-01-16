import React, {useState} from "react";
import {Types} from "aptos";
import {
  Box,
  Typography,
  Stack,
  useTheme,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import JsonViewCard from "../../../components/IndividualPageContent/JsonViewCard";
import IdentifiedPayloadCard, {
  canDisplayIdentifiedPayload,
} from "./Components/IdentifiedPayloadCard";

type PayloadTabProps = {
  transaction: Types.Transaction;
};

export default function PayloadTab({transaction}: PayloadTabProps) {
  const theme = useTheme();
  const [jsonExpanded, setJsonExpanded] = useState(false);

  if (!("payload" in transaction)) {
    return <EmptyTabContent />;
  }

  const payload = transaction.payload;
  const canShowIdentified = canDisplayIdentifiedPayload(payload);

  // If we can display an identified payload, show it with optional JSON below
  if (canShowIdentified) {
    return (
      <Box marginTop={3}>
        <IdentifiedPayloadCard payload={payload} />

        {/* Collapsible raw JSON view */}
        <Accordion
          expanded={jsonExpanded}
          onChange={(_event, isExpanded) => setJsonExpanded(isExpanded)}
          sx={{
            marginTop: 2,
            backgroundColor: theme.palette.background.paper,
            borderRadius: `${theme.shape.borderRadius}px !important`,
            "&:before": {
              display: "none",
            },
            "&.Mui-expanded": {
              margin: 0,
              marginTop: 2,
            },
          }}
          disableGutters
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              padding: "8px 16px",
              minHeight: "unset",
              "& .MuiAccordionSummary-content": {
                margin: "8px 0",
              },
            }}
          >
            <Typography
              variant="body2"
              sx={{color: theme.palette.text.secondary}}
            >
              Raw JSON
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{padding: 2, paddingTop: 0}}>
            {jsonExpanded && <JsonViewCard data={payload} />}
          </AccordionDetails>
        </Accordion>
      </Box>
    );
  }

  // Fallback to JSON view for unidentified payloads
  return (
    <Box marginTop={3}>
      <Stack spacing={1} sx={{mb: 2}}>
        <Typography
          variant="subtitle2"
          sx={{color: theme.palette.text.secondary}}
        >
          Payload Type: {payload.type}
        </Typography>
      </Stack>
      <JsonViewCard data={payload} />
    </Box>
  );
}
