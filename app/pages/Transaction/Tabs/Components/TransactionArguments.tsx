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
import {useCallback, useMemo, useState} from "react";
import type {Types} from "~/types/aptos";
import {useGetAccountModule} from "../../../../api/hooks/useGetAccountModule";
import {useGetAccountPackages} from "../../../../api/hooks/useGetAccountResource";
import {lookupFunctionArgumentNameOverride} from "../../../../data/functionArgumentNameOverrides";
import {
  extractFunctionParamNames,
  extractFunctionTypeParamNames,
  transformCode,
} from "../../../../utils";
import {
  extractEntryFunctionPayload,
  generateCliCommand,
} from "../../../../utils/cliCommand";
import MoveFunctionParamTypeBadge from "./MoveFunctionParamTypeBadge";

const TOOLTIP_TIME = 2000;

type TransactionArgumentsProps = {
  transaction: Types.Transaction;
};

function ArgumentCard({
  index,
  type,
  value,
  isTypeArg,
  paramName,
}: {
  index: number;
  type?: string;
  value: string;
  isTypeArg?: boolean;
  /** From Move source when available (same idea as the account run tab). */
  paramName?: string | null;
}) {
  const theme = useTheme();
  const positionLabel = isTypeArg
    ? (paramName ?? `T${index}`)
    : (paramName ?? `#${index}`);
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
          {positionLabel}
        </Typography>
        {type && <MoveFunctionParamTypeBadge typeStr={type} variant="card" />}
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
  verticalAlign: "top",
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

  const ledgerVersion =
    "version" in transaction && transaction.version !== undefined
      ? Number(transaction.version)
      : undefined;

  const {data: moduleData} = useGetAccountModule(
    address ?? "",
    moduleName ?? "",
    ledgerVersion,
    {enabled: hasValidFunction},
  );

  const {packages} = useGetAccountPackages(address ?? "", ledgerVersion);

  const moveFunction = moduleData?.abi?.exposed_functions?.find(
    (fn) => fn.name === functionName,
  );

  const paramTypes = moveFunction?.params;
  const filteredParams = paramTypes?.filter(
    (p) => p !== "&signer" && p !== "signer",
  );

  const moduleSource = useMemo(() => {
    if (!moduleName) return undefined;
    for (const pkg of packages) {
      const mod = pkg.modules.find((m) => m.name === moduleName);
      if (mod?.source) return mod.source;
    }
    return undefined;
  }, [packages, moduleName]);

  const {functionArgNames, typeArgNames} = useMemo(() => {
    if (!payload || !functionName) {
      return {
        functionArgNames: null as string[] | null,
        typeArgNames: null as string[] | null,
      };
    }

    const fromOverride =
      address && moduleName
        ? lookupFunctionArgumentNameOverride(
            address,
            moduleName,
            functionName,
            payload.arguments.length,
          )
        : null;

    let typeNames: string[] | null = null;
    let fnArgNames: string[] | null = null;

    if (moduleSource) {
      const decoded = transformCode(moduleSource);
      const rawTypeNames = extractFunctionTypeParamNames(decoded, functionName);
      typeNames =
        rawTypeNames && rawTypeNames.length === payload.type_arguments.length
          ? rawTypeNames
          : null;

      if (moveFunction && filteredParams) {
        const rawParamNames = extractFunctionParamNames(decoded, functionName);
        // Map source names to serialized args by ABI position: drop every signer
        // slot (not only a single leading signer).
        if (
          rawParamNames &&
          rawParamNames.length === moveFunction.params.length
        ) {
          const nonSignerIndices = moveFunction.params.reduce<number[]>(
            (indices, param, index) => {
              if (param !== "signer" && param !== "&signer") {
                indices.push(index);
              }
              return indices;
            },
            [],
          );
          if (nonSignerIndices.length === filteredParams.length) {
            fnArgNames = nonSignerIndices.map((idx) => rawParamNames[idx]);
          }
        }
      }
    }

    return {
      functionArgNames: fromOverride ?? fnArgNames,
      typeArgNames: typeNames,
    };
  }, [
    payload,
    moduleSource,
    functionName,
    moveFunction,
    filteredParams,
    address,
    moduleName,
  ]);

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
  const showTypeArgNames = typeArgNames !== null;
  const showFunctionArgNames = functionArgNames !== null;

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
                      paramName={typeArgNames?.[i]}
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
                <TableContainer sx={{maxWidth: "100%", overflowX: "auto"}}>
                  <Table size="small" sx={{tableLayout: "auto", width: "100%"}}>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            ...cellSx,
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            color: theme.palette.text.secondary,
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            whiteSpace: "nowrap",
                            width: showTypeArgNames ? undefined : "1%",
                          }}
                        >
                          {showTypeArgNames ? "Name" : "#"}
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
                                whiteSpace: "nowrap",
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
                              overflowWrap: "anywhere",
                            }}
                          >
                            {typeArgNames?.[i] ?? `T${i}`}
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
                              overflowWrap: "anywhere",
                              borderBottom: `1px solid ${theme.palette.divider}`,
                            }}
                          >
                            <MoveFunctionParamTypeBadge
                              typeStr={typeArg}
                              variant="typeArgTable"
                            />
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
                      paramName={functionArgNames?.[i]}
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
                <TableContainer sx={{maxWidth: "100%", overflowX: "auto"}}>
                  <Table size="small" sx={{tableLayout: "auto", width: "100%"}}>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            ...cellSx,
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            color: theme.palette.text.secondary,
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            whiteSpace: "nowrap",
                            width: showFunctionArgNames ? undefined : "1%",
                          }}
                        >
                          {showFunctionArgNames ? "Name" : "#"}
                        </TableCell>
                        {filteredParams && (
                          <TableCell
                            sx={{
                              ...cellSx,
                              fontWeight: 600,
                              fontSize: "0.75rem",
                              color: theme.palette.text.secondary,
                              borderBottom: `1px solid ${theme.palette.divider}`,
                              whiteSpace: "nowrap",
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
                              overflowWrap: "anywhere",
                            }}
                          >
                            {functionArgNames?.[i] ?? `#${i}`}
                          </TableCell>
                          {filteredParams && (
                            <TableCell
                              sx={{
                                ...cellSx,
                                borderBottom: `1px solid ${theme.palette.divider}`,
                                overflowWrap: "anywhere",
                              }}
                            >
                              <MoveFunctionParamTypeBadge
                                typeStr={filteredParams[i] ?? "unknown"}
                              />
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
