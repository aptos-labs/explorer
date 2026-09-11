import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import {useState} from "react";
import type * as React from "react";
import {getSemanticColors} from "../../../../themes/colors/aptosBrandColors";
import type {
  PaymentFlowEdge,
  PaymentFlowGraph,
  PaymentKind,
} from "../../payments/types";
import {paymentFlowToMermaid} from "../../payments/mermaid";

function edgeColor(
  kind: PaymentKind | "fee",
  colors: ReturnType<typeof getSemanticColors>,
): string {
  switch (kind) {
    case "p2p":
      return colors.status.info;
    case "controlled":
      return colors.status.warning;
    case "confidential":
    case "confidential_to_public":
    case "public_to_confidential":
      return colors.primary;
    case "exchange":
      return colors.status.success;
    case "fee":
      return colors.text.secondary;
    default:
      return colors.text.primary;
  }
}

function FlowNodeChip({label, role}: {label: string; role: string}) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        px: 1.5,
        py: 1,
        borderRadius: 1,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        minWidth: 120,
        textAlign: "center",
      }}
    >
      <Typography
        variant="caption"
        sx={{color: "text.secondary", display: "block"}}
      >
        {role.replaceAll("_", " ")}
      </Typography>
      <Typography
        variant="body2"
        sx={{fontWeight: 600, wordBreak: "break-word"}}
      >
        {label}
      </Typography>
    </Box>
  );
}

function FlowEdgeRow({
  graph,
  edge,
}: {
  graph: PaymentFlowGraph;
  edge: PaymentFlowEdge;
}) {
  const theme = useTheme();
  const colors = getSemanticColors(theme.palette.mode);
  const from = graph.nodes.find((node) => node.id === edge.from);
  const to = graph.nodes.find((node) => node.id === edge.to);
  if (!from || !to) return null;
  const color = edgeColor(edge.kind, colors);

  return (
    <Stack
      direction={{xs: "column", sm: "row"}}
      spacing={1}
      sx={{alignItems: {xs: "stretch", sm: "center"}}}
    >
      <FlowNodeChip label={from.label} role={from.role} />
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minWidth: {sm: 96},
          px: 1,
        }}
      >
        <Typography
          variant="caption"
          sx={{color, fontWeight: 700, textAlign: "center"}}
        >
          {edge.label}
        </Typography>
        <Box
          aria-hidden
          sx={{
            width: {xs: 2, sm: "100%"},
            height: {xs: 24, sm: 2},
            backgroundColor: color,
            position: "relative",
            my: 0.5,
          }}
        />
      </Box>
      <FlowNodeChip label={to.label} role={to.role} />
    </Stack>
  );
}

type PaymentFlowDiagramProps = {
  flow: PaymentFlowGraph;
};

/**
 * Visual rendering of the same graph encoded as Mermaid `flowchart LR`.
 * We do not load the mermaid package (CSP, SSR, and bundle size).
 */
export default function PaymentFlowDiagram({
  flow,
}: PaymentFlowDiagramProps): React.JSX.Element | null {
  const [copied, setCopied] = useState(false);
  const mermaid = paymentFlowToMermaid(flow);

  if (flow.edges.length === 0) return null;

  const copy = async () => {
    await navigator.clipboard.writeText(mermaid);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h6" component="h3">
        Payment flow
      </Typography>
      <Typography variant="body2" sx={{color: "text.secondary"}}>
        Each arrow is one step in this transaction. Copy the Mermaid source if
        you want the same diagram in docs or another renderer.
      </Typography>
      <Stack spacing={2} aria-label="Payment flow diagram">
        {flow.edges.map((edge, i) => (
          <FlowEdgeRow
            key={`${edge.from}-${edge.to}-${edge.label}-${i}`}
            graph={flow}
            edge={edge}
          />
        ))}
      </Stack>
      <Accordion
        defaultExpanded
        disableGutters
        elevation={0}
        sx={{border: 1, borderColor: "divider"}}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2" sx={{fontWeight: 600}}>
            Mermaid source
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{position: "relative"}}>
            <Tooltip title={copied ? "Copied" : "Copy Mermaid"}>
              <IconButton
                size="small"
                onClick={copy}
                aria-label="Copy Mermaid source"
                sx={{position: "absolute", top: 0, right: 0}}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Box
              component="pre"
              aria-label="Mermaid source"
              sx={{
                m: 0,
                pr: 5,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                fontFamily: "monospace",
                fontSize: 13,
              }}
            >
              {mermaid}
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Stack>
  );
}
