import CheckIcon from "@mui/icons-material/Check";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import TerminalIcon from "@mui/icons-material/Terminal";
import {
  Box,
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

export default function TransactionArguments({
  transaction,
}: TransactionArgumentsProps) {
  const theme = useTheme();
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

  return (
    <Box>
      {payload.type_arguments.length > 0 && (
        <Box sx={{mb: 2}}>
          <Typography
            variant="subtitle2"
            sx={{color: theme.palette.text.secondary, mb: 1}}
          >
            Type Arguments
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
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
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          color: theme.palette.text.secondary,
                          borderBottom: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        Constraint
                      </TableCell>
                    )}
                  <TableCell
                    sx={{
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
                  // biome-ignore lint/suspicious/noArrayIndexKey: type arguments are positional and never reordered
                  <TableRow key={`type-arg-${typeArg}-${i}`}>
                    <TableCell
                      sx={{
                        fontSize: "0.8rem",
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
                            fontSize: "0.8rem",
                            color: theme.palette.text.secondary,
                            borderBottom: `1px solid ${theme.palette.divider}`,
                          }}
                        >
                          {moveFunction.generic_type_params[i]?.constraints
                            ?.length > 0
                            ? moveFunction.generic_type_params[
                                i
                              ].constraints.join(" + ")
                            : "-"}
                        </TableCell>
                      )}
                    <TableCell
                      sx={{
                        fontSize: "0.8rem",
                        fontFamily: "monospace",
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
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
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
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        color: theme.palette.text.secondary,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      Type
                    </TableCell>
                  )}
                  <TableCell
                    sx={{
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
                  // biome-ignore lint/suspicious/noArrayIndexKey: arguments are positional and never reordered
                  <TableRow key={`arg-${i}`}>
                    <TableCell
                      sx={{
                        fontSize: "0.8rem",
                        borderBottom: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      {i}
                    </TableCell>
                    {filteredParams && (
                      <TableCell
                        sx={{
                          fontSize: "0.8rem",
                          fontFamily: "monospace",
                          color: theme.palette.primary.main,
                          borderBottom: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        {filteredParams[i] ?? "unknown"}
                      </TableCell>
                    )}
                    <TableCell
                      sx={{
                        fontSize: "0.8rem",
                        fontFamily: "monospace",
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
        </Box>
      )}

      {cliCommand && (
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
              fontSize: "0.8rem",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
              overflowX: "auto",
              color: theme.palette.text.primary,
            }}
          >
            {cliCommand}
          </Box>
        </Box>
      )}
    </Box>
  );
}
