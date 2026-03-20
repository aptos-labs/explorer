import CheckIcon from "@mui/icons-material/Check";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TerminalIcon from "@mui/icons-material/Terminal";
import {
  Box,
  Collapse,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {useCallback, useState} from "react";
import type {Types} from "~/types/aptos";
import {useGetAccountModule} from "../../../../api/hooks/useGetAccountModule";
import {
  extractEntryFunctionPayload,
  generateCliCommand,
} from "../../../../utils/cliCommand";

const TOOLTIP_TIME = 2000;

type TransactionArgumentsProps = {
  transaction: Types.Transaction;
};

function ArgumentCard({
  index,
  type,
  value,
  isTypeArg,
}: {
  index: number;
  type?: string;
  value: string;
  isTypeArg?: boolean;
}) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        borderBottom: `1px solid ${theme.palette.divider}`,
        py: 1.5,
        "&:last-child": {borderBottom: "none"},
      }}
    >
      <Stack direction="row" spacing={1} alignItems="baseline" sx={{mb: 0.5}}>
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            fontWeight: 600,
            minWidth: 24,
          }}
        >
          {isTypeArg ? `T${index}` : `#${index}`}
        </Typography>
        {type && (
          <Typography
            variant="caption"
            sx={{
              fontFamily: "monospace",
              color: theme.palette.primary.main,
            }}
          >
            {type}
          </Typography>
        )}
      </Stack>
      <Typography
        variant="body2"
        sx={{
          fontFamily: "monospace",
          fontSize: "0.8rem",
          overflowWrap: "anywhere",
          wordBreak: "break-all",
          pl: 3.5,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

const cellSx = {
  fontSize: "0.8rem",
  py: 1,
  px: 1.5,
} as const;

export default function TransactionArguments({
  transaction,
}: TransactionArgumentsProps) {
  const theme = useTheme();
  const isMobile = !useMediaQuery(theme.breakpoints.up("md"));
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const payload = extractEntryFunctionPayload(transaction);

  const functionParts = payload?.function?.split("::") ?? [];
  const [address, moduleName, functionName] = functionParts;

  const hasValidFunction = !!(address && moduleName && functionName);

  const {data: moduleData} = useGetAccountModule(
    address ?? "",
    moduleName ?? "",
    {enabled: hasValidFunction},
  );

  const moveFunction = moduleData?.abi?.exposed_functions?.find(
    (fn) => fn.name === functionName,
  );

  const paramTypes = moveFunction?.params;
  const filteredParams = paramTypes?.filter(
    (p) => p !== "&signer" && p !== "signer",
  );

  const cliCommand = payload
    ? generateCliCommand(payload, paramTypes)
    : undefined;

  const handleCopy = useCallback(async () => {
    if (!cliCommand) return;
    try {
      await navigator.clipboard.writeText(cliCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), TOOLTIP_TIME);
    } catch {
      // clipboard API may not be available
    }
  }, [cliCommand]);

  if (!payload) return null;
  if (payload.arguments.length === 0 && payload.type_arguments.length === 0) {
    return null;
  }

  const argCount = payload.arguments.length + payload.type_arguments.length;

  return (
    <Box sx={{width: "100%"}}>
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          cursor: "pointer",
          userSelect: "none",
          color: theme.palette.primary.main,
          fontSize: "0.8rem",
          "&:hover": {opacity: 0.8},
        }}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-label={`${expanded ? "Hide" : "Show"} ${argCount} argument${argCount !== 1 ? "s" : ""}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded(!expanded);
          }
        }}
      >
        {expanded ? (
          <ExpandLessIcon sx={{fontSize: 18}} />
        ) : (
          <ExpandMoreIcon sx={{fontSize: 18}} />
        )}
        <span>
          {argCount} argument{argCount !== 1 ? "s" : ""}
        </span>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{mt: 1.5, maxWidth: "100%", overflow: "hidden"}}>
          {payload.type_arguments.length > 0 && (
            <Box sx={{mb: 2}}>
              <Typography
                variant="subtitle2"
                sx={{color: theme.palette.text.secondary, mb: 1}}
              >
                Type Arguments
              </Typography>
              {isMobile ? (
                <Box>
                  {payload.type_arguments.map((typeArg, i) => (
                    <ArgumentCard
                      // biome-ignore lint/suspicious/noArrayIndexKey: positional, never reordered
                      key={`type-arg-${i}`}
                      index={i}
                      isTypeArg
                      type={
                        moveFunction?.generic_type_params[i]?.constraints
                          ?.length
                          ? moveFunction.generic_type_params[
                              i
                            ].constraints.join(" + ")
                          : undefined
                      }
                      value={typeArg}
                    />
                  ))}
                </Box>
              ) : (
                <TableContainer sx={{maxWidth: "100%"}}>
                  <Table
                    size="small"
                    sx={{tableLayout: "fixed", width: "100%"}}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            ...cellSx,
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            color: theme.palette.text.secondary,
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            width: 40,
                          }}
                        >
                          #
                        </TableCell>
                        {moveFunction &&
                          moveFunction.generic_type_params.length > 0 && (
                            <TableCell
                              sx={{
                                ...cellSx,
                                fontWeight: 600,
                                fontSize: "0.75rem",
                                color: theme.palette.text.secondary,
                                borderBottom: `1px solid ${theme.palette.divider}`,
                                width: 120,
                              }}
                            >
                              Constraint
                            </TableCell>
                          )}
                        <TableCell
                          sx={{
                            ...cellSx,
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            color: theme.palette.text.secondary,
                            borderBottom: `1px solid ${theme.palette.divider}`,
                          }}
                        >
                          Value
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {payload.type_arguments.map((typeArg, i) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: positional, never reordered
                        <TableRow key={`type-arg-${typeArg}-${i}`}>
                          <TableCell
                            sx={{
                              ...cellSx,
                              fontFamily: "monospace",
                              borderBottom: `1px solid ${theme.palette.divider}`,
                            }}
                          >
                            T{i}
                          </TableCell>
                          {moveFunction &&
                            moveFunction.generic_type_params.length > 0 && (
                              <TableCell
                                sx={{
                                  ...cellSx,
                                  color: theme.palette.text.secondary,
                                  borderBottom: `1px solid ${theme.palette.divider}`,
                                  overflowWrap: "anywhere",
                                }}
                              >
                                {moveFunction.generic_type_params[i]
                                  ?.constraints?.length > 0
                                  ? moveFunction.generic_type_params[
                                      i
                                    ].constraints.join(" + ")
                                  : "-"}
                              </TableCell>
                            )}
                          <TableCell
                            sx={{
                              ...cellSx,
                              fontFamily: "monospace",
                              overflowWrap: "anywhere",
                              wordBreak: "break-all",
                              borderBottom: `1px solid ${theme.palette.divider}`,
                            }}
                          >
                            {typeArg}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          {payload.arguments.length > 0 && (
            <Box sx={{mb: 2}}>
              <Typography
                variant="subtitle2"
                sx={{color: theme.palette.text.secondary, mb: 1}}
              >
                Function Arguments
              </Typography>
              {isMobile ? (
                <Box>
                  {payload.arguments.map((arg, i) => (
                    <ArgumentCard
                      // biome-ignore lint/suspicious/noArrayIndexKey: positional, never reordered
                      key={`arg-${i}`}
                      index={i}
                      type={filteredParams?.[i]}
                      value={
                        typeof arg === "object"
                          ? JSON.stringify(arg)
                          : String(arg)
                      }
                    />
                  ))}
                </Box>
              ) : (
                <TableContainer sx={{maxWidth: "100%"}}>
                  <Table
                    size="small"
                    sx={{tableLayout: "fixed", width: "100%"}}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            ...cellSx,
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            color: theme.palette.text.secondary,
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            width: 40,
                          }}
                        >
                          #
                        </TableCell>
                        {filteredParams && (
                          <TableCell
                            sx={{
                              ...cellSx,
                              fontWeight: 600,
                              fontSize: "0.75rem",
                              color: theme.palette.text.secondary,
                              borderBottom: `1px solid ${theme.palette.divider}`,
                              width: 140,
                            }}
                          >
                            Type
                          </TableCell>
                        )}
                        <TableCell
                          sx={{
                            ...cellSx,
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            color: theme.palette.text.secondary,
                            borderBottom: `1px solid ${theme.palette.divider}`,
                          }}
                        >
                          Value
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {payload.arguments.map((arg, i) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: positional, never reordered
                        <TableRow key={`arg-${i}`}>
                          <TableCell
                            sx={{
                              ...cellSx,
                              borderBottom: `1px solid ${theme.palette.divider}`,
                            }}
                          >
                            {i}
                          </TableCell>
                          {filteredParams && (
                            <TableCell
                              sx={{
                                ...cellSx,
                                fontFamily: "monospace",
                                color: theme.palette.primary.main,
                                borderBottom: `1px solid ${theme.palette.divider}`,
                                overflowWrap: "anywhere",
                              }}
                            >
                              {filteredParams[i] ?? "unknown"}
                            </TableCell>
                          )}
                          <TableCell
                            sx={{
                              ...cellSx,
                              fontFamily: "monospace",
                              overflowWrap: "anywhere",
                              wordBreak: "break-all",
                              borderBottom: `1px solid ${theme.palette.divider}`,
                            }}
                          >
                            {typeof arg === "object"
                              ? JSON.stringify(arg)
                              : String(arg)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          {cliCommand && !isMobile && (
            <Box>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{mb: 1}}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <TerminalIcon
                    sx={{fontSize: 16, color: theme.palette.text.secondary}}
                  />
                  <Typography
                    variant="subtitle2"
                    sx={{color: theme.palette.text.secondary}}
                  >
                    CLI Command
                  </Typography>
                </Stack>
                <Tooltip title={copied ? "Copied!" : "Copy CLI command"}>
                  <IconButton
                    size="small"
                    onClick={handleCopy}
                    aria-label="Copy CLI command"
                  >
                    {copied ? (
                      <CheckIcon sx={{fontSize: 16}} color="success" />
                    ) : (
                      <ContentCopyIcon sx={{fontSize: 16}} />
                    )}
                  </IconButton>
                </Tooltip>
              </Stack>
              <Box
                sx={{
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(0,0,0,0.3)"
                      : "rgba(0,0,0,0.04)",
                  borderRadius: 1,
                  padding: 2,
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                  wordBreak: "break-all",
                  overflowX: "auto",
                  maxWidth: "100%",
                  color: theme.palette.text.primary,
                }}
              >
                {cliCommand}
              </Box>
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}
