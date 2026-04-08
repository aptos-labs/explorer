import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {
  alpha,
  Box,
  Chip,
  Collapse,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import type React from "react";
import {memo, useMemo, useState} from "react";
import HashButton, {HashType} from "../../../components/HashButton";
import {Link} from "../../../routing";
import type {SentioCallTraceNode} from "../../../utils/sentioCallTrace";
import {
  buildAccountModuleRunPath,
  buildFailureMap,
  formatTraceError,
  isNodeFailed,
  normalizeSentioAddress,
  parseMoveFunctionParts,
} from "../../../utils/sentioCallTrace";

type TraceSubtreeProps = {
  node: SentioCallTraceNode;
  depth: number;
  defaultExpanded: boolean;
  childIndex: number;
  txFailed: boolean;
  failureMap: WeakMap<SentioCallTraceNode, boolean>;
};

function formatGas(gas: number): string {
  if (gas === 0) {
    return "0 gas";
  }
  return `${gas.toLocaleString()} gas`;
}

const TraceSubtree = memo(function TraceSubtree({
  node,
  depth,
  defaultExpanded,
  childIndex,
  txFailed,
  failureMap,
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

  const failed = isNodeFailed(node);
  const onFailurePath = !failed && txFailed && (failureMap.get(node) ?? false);

  const errorColor = theme.palette.error.main;
  const defaultBorderColor = theme.palette.divider;

  const leftBorderColor = failed
    ? errorColor
    : onFailurePath
      ? alpha(errorColor, 0.45)
      : defaultBorderColor;
  const leftBorderStyle = failed ? "solid" : onFailurePath ? "dashed" : "solid";

  return (
    <Box
      sx={{
        marginLeft: depth > 0 ? {xs: 0.5, sm: 1.5} : 0,
        paddingLeft: depth > 0 ? {xs: 1, sm: 1.5} : 0,
        borderLeft:
          depth > 0 ? `2px ${leftBorderStyle} ${leftBorderColor}` : "none",
        minWidth: 0,
      }}
    >
      <Stack spacing={{xs: 0.5, sm: 0.25}} sx={{py: {xs: 0.5, sm: 0.35}}}>
        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            alignItems: "flex-start",
            minWidth: 0,
            ...(failed && {
              backgroundColor: alpha(errorColor, 0.08),
              borderRadius: 1,
              px: 1,
              py: 0.5,
              mx: -1,
            }),
          }}
        >
          <Box
            sx={{
              width: {xs: 40, sm: 32},
              flexShrink: 0,
              display: "flex",
              justifyContent: "center",
              pt: {xs: 0.125, sm: 0.25},
            }}
          >
            {hasKids ? (
              <IconButton
                aria-expanded={open}
                aria-label={
                  open ? "Collapse nested calls" : "Expand nested calls"
                }
                size="medium"
                sx={{
                  padding: {xs: 1, sm: 0.5},
                }}
                onClick={() => setOpen(!open)}
              >
                {open ? (
                  <ExpandMoreIcon fontSize="small" />
                ) : (
                  <ChevronRightIcon fontSize="small" />
                )}
              </IconButton>
            ) : failed ? (
              <ErrorOutlineIcon
                fontSize="small"
                sx={{color: errorColor, mt: {xs: 0.5, sm: 0.25}}}
                titleAccess="This call failed"
              />
            ) : null}
          </Box>
          <Box sx={{flex: 1, minWidth: 0}}>
            <Stack
              direction="row"
              spacing={1}
              sx={{alignItems: "center", flexWrap: "wrap"}}
            >
              <Typography
                component="div"
                variant="body2"
                sx={{
                  fontWeight: 600,
                  fontSize: {xs: "0.8rem", sm: undefined},
                  lineHeight: 1.35,
                  wordBreak: "break-word",
                  overflowWrap: "anywhere",
                  ...(failed && {color: errorColor}),
                }}
              >
                {runPath ? (
                  <Link
                    to={runPath}
                    style={{color: failed ? errorColor : "inherit"}}
                  >
                    {node.functionName}
                  </Link>
                ) : (
                  node.functionName
                )}
              </Typography>
              {failed && node.error && (
                <Chip
                  label={formatTraceError(node.error)}
                  size="small"
                  color="error"
                  variant="outlined"
                  sx={{
                    height: 20,
                    fontSize: "0.7rem",
                    maxWidth: {xs: "100%", sm: 360},
                    "& .MuiChip-label": {
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    },
                  }}
                />
              )}
            </Stack>
            <Stack
              direction={{xs: "column", sm: "row"}}
              sx={{
                alignItems: {xs: "flex-start", sm: "center"},
                flexWrap: "wrap",
                columnGap: 0.75,
                rowGap: {xs: 0.75, sm: 0.25},
                mt: {xs: 0.75, sm: 0.25},
              }}
            >
              <Stack
                direction="row"
                sx={{
                  alignItems: "center",
                  flexWrap: "wrap",
                  columnGap: 0.5,
                  minWidth: 0,
                  maxWidth: "100%",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Caller
                </Typography>
                {caller ? (
                  <Box sx={{minWidth: 0, maxWidth: "100%"}}>
                    <HashButton
                      hash={caller}
                      type={HashType.ACCOUNT}
                      size="small"
                    />
                  </Box>
                ) : (
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    component="span"
                    sx={{wordBreak: "break-all"}}
                  >
                    {node.from}
                  </Typography>
                )}
              </Stack>
              <Stack
                direction="row"
                sx={{
                  alignItems: "center",
                  flexWrap: "wrap",
                  columnGap: 0.5,
                  minWidth: 0,
                  maxWidth: "100%",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Callee
                </Typography>
                {callee ? (
                  <Box sx={{minWidth: 0, maxWidth: "100%"}}>
                    <HashButton
                      hash={callee}
                      type={HashType.ACCOUNT}
                      size="small"
                    />
                  </Box>
                ) : (
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    component="span"
                    sx={{wordBreak: "break-all"}}
                  >
                    {node.to}
                  </Typography>
                )}
              </Stack>
            </Stack>
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              flexShrink: 0,
              pt: {xs: 0, sm: 0.35},
              display: {xs: "none", sm: "block"},
              alignSelf: "flex-start",
            }}
          >
            {formatGas(node.gasUsed)}
          </Typography>
        </Stack>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: {xs: "block", sm: "none"},
            alignSelf: "flex-end",
            pr: 0.5,
          }}
        >
          {formatGas(node.gasUsed)}
        </Typography>
      </Stack>
      {hasKids ? (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <Box>
            {node.calls.map((child, i) => (
              <TraceSubtree
                // biome-ignore lint/suspicious/noArrayIndexKey: Sentio preserves stable execution order; avoids JSON.stringify per child during render
                key={`${depth}:${childIndex}:${i}:${child.functionName}:${child.to}`}
                node={child}
                depth={depth + 1}
                defaultExpanded={depth + 1 < 2}
                childIndex={i}
                txFailed={txFailed}
                failureMap={failureMap}
              />
            ))}
          </Box>
        </Collapse>
      ) : null}
    </Box>
  );
});

type CallTraceGraphProps = {
  root: SentioCallTraceNode;
  txFailed?: boolean;
};

const EMPTY_FAILURE_MAP = new WeakMap<SentioCallTraceNode, boolean>();

export default function CallTraceGraph({
  root,
  txFailed = false,
}: CallTraceGraphProps): React.JSX.Element {
  const theme = useTheme();
  const failureMap = useMemo(
    () => (txFailed ? buildFailureMap(root) : EMPTY_FAILURE_MAP),
    [root, txFailed],
  );

  return (
    <Box
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        p: {xs: 1, sm: 2},
        backgroundColor: theme.palette.background.paper,
        maxWidth: "100%",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <TraceSubtree
        node={root}
        depth={0}
        defaultExpanded
        childIndex={0}
        txFailed={txFailed}
        failureMap={failureMap}
      />
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
    <Typography variant="body2" component="div" sx={{wordBreak: "break-word"}}>
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
