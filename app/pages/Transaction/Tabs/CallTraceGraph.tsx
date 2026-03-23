import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {
  Box,
  Collapse,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import type React from "react";
import {useState} from "react";
import HashButton, {HashType} from "../../../components/HashButton";
import {Link} from "../../../routing";
import type {SentioCallTraceNode} from "../../../utils/sentioCallTrace";
import {
  buildAccountModuleCodePath,
  buildAccountModuleRunPath,
  normalizeSentioAddress,
  parseMoveFunctionParts,
} from "../../../utils/sentioCallTrace";

function traceChildKey(child: SentioCallTraceNode): string {
  const inputSig = JSON.stringify(child.inputs);
  return `${child.to}::${child.functionName}::${child.gasUsed}::${inputSig}`;
}

type TraceSubtreeProps = {
  node: SentioCallTraceNode;
  depth: number;
  defaultExpanded: boolean;
};

function formatGas(gas: number): string {
  if (gas === 0) {
    return "0 gas";
  }
  return `${gas.toLocaleString()} gas`;
}

function TraceSubtree({
  node,
  depth,
  defaultExpanded,
}: TraceSubtreeProps): React.JSX.Element {
  const theme = useTheme();
  const [open, setOpen] = useState(defaultExpanded);
  const hasKids = node.calls.length > 0;
  const caller = normalizeSentioAddress(node.from);
  const callee = normalizeSentioAddress(node.to);
  const parts = parseMoveFunctionParts(node.functionName);
  const runPath =
    callee && parts
      ? buildAccountModuleRunPath(callee, parts.module, parts.fn)
      : null;
  const codePath =
    callee && parts ? buildAccountModuleCodePath(callee, parts.module) : null;

  const borderColor = theme.palette.divider;

  return (
    <Box
      sx={{
        marginLeft: depth > 0 ? 1.5 : 0,
        paddingLeft: depth > 0 ? 1.5 : 0,
        borderLeft: depth > 0 ? `1px solid ${borderColor}` : "none",
      }}
    >
      <Stack
        direction="row"
        alignItems="flex-start"
        spacing={0.5}
        sx={{py: 0.35, minHeight: 36}}
      >
        <Box
          sx={{
            width: 32,
            flexShrink: 0,
            display: "flex",
            justifyContent: "center",
            pt: 0.25,
          }}
        >
          {hasKids ? (
            <IconButton
              aria-expanded={open}
              aria-label={
                open ? "Collapse nested calls" : "Expand nested calls"
              }
              size="small"
              onClick={() => setOpen(!open)}
            >
              {open ? (
                <ExpandMoreIcon fontSize="small" />
              ) : (
                <ChevronRightIcon fontSize="small" />
              )}
            </IconButton>
          ) : null}
        </Box>
        <Box sx={{flex: 1, minWidth: 0}}>
          <Stack
            direction="row"
            alignItems="baseline"
            flexWrap="wrap"
            columnGap={1}
            rowGap={0.25}
          >
            <Typography component="span" variant="body2" fontWeight={600}>
              {runPath ? (
                <Link to={runPath} style={{wordBreak: "break-all"}}>
                  {node.functionName}
                </Link>
              ) : (
                node.functionName
              )}
            </Typography>
            {codePath ? (
              <Link
                to={codePath}
                style={{fontSize: theme.typography.caption.fontSize}}
              >
                View module code
              </Link>
            ) : null}
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            flexWrap="wrap"
            columnGap={0.75}
            rowGap={0.25}
            sx={{mt: 0.25}}
          >
            <Typography variant="caption" color="text.secondary">
              Caller
            </Typography>
            {caller ? (
              <HashButton hash={caller} type={HashType.ACCOUNT} size="small" />
            ) : (
              <Typography
                variant="caption"
                color="text.disabled"
                component="span"
              >
                {node.from}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ml: 1}}>
              Callee
            </Typography>
            {callee ? (
              <HashButton hash={callee} type={HashType.ACCOUNT} size="small" />
            ) : (
              <Typography
                variant="caption"
                color="text.disabled"
                component="span"
              >
                {node.to}
              </Typography>
            )}
          </Stack>
        </Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{flexShrink: 0, pt: 0.35}}
        >
          {formatGas(node.gasUsed)}
        </Typography>
      </Stack>
      {hasKids ? (
        <Collapse in={open} timeout="auto" unmountOnExit={false}>
          <Box>
            {node.calls.map((child) => (
              <TraceSubtree
                key={traceChildKey(child)}
                node={child}
                depth={depth + 1}
                defaultExpanded={depth + 1 < 2}
              />
            ))}
          </Box>
        </Collapse>
      ) : null}
    </Box>
  );
}

type CallTraceGraphProps = {
  root: SentioCallTraceNode;
};

export default function CallTraceGraph({
  root,
}: CallTraceGraphProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <Box
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        p: 2,
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <TraceSubtree node={root} depth={0} defaultExpanded />
    </Box>
  );
}

export function SentioTraceExternalLink({
  href,
  label,
}: {
  href: string;
  label: string;
}): React.JSX.Element {
  return (
    <Typography variant="body2" component="div">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{color: "inherit"}}
      >
        {label}
        <OpenInNewIcon
          sx={{fontSize: 14, ml: 0.5, verticalAlign: "text-bottom"}}
        />
      </a>
    </Typography>
  );
}
