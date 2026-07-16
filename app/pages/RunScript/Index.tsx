import {
  type InputTransactionData,
  useWallet,
} from "@aptos-labs/wallet-adapter-react";
import AddIcon from "@mui/icons-material/Add";
import CheckCircle from "@mui/icons-material/CheckCircle";
import ContentCopy from "@mui/icons-material/ContentCopy";
import DeleteOutline from "@mui/icons-material/DeleteOutlined";
import ErrorIcon from "@mui/icons-material/Error";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import OpenInNew from "@mui/icons-material/OpenInNew";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CircularProgress,
  Collapse,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import {useState} from "react";
import {PageMetadata} from "../../components/hooks/usePageMetadata";
import StyledTooltip from "../../components/StyledTooltip";
import {WalletConnector} from "../../components/WalletConnector";
import {useNetworkName, useSdkV2Client} from "../../global-config/GlobalConfig";
import {Link} from "../../routing";
import {sortPetraFirst} from "../../utils";
import useSubmitTransaction from "../../api/hooks/useSubmitTransaction";
import PageHeader from "../layout/PageHeader";
import {
  type ScriptArgInput,
  SCRIPT_ARG_TYPE_OPTIONS,
  convertScriptFunctionArguments,
  getScriptArgPlaceholder,
  normalizeScriptBytecode,
} from "./scriptArguments";

const TOOLTIP_TIME = 2000;

function ResultCard({
  success,
  children,
  sx,
}: {
  success: boolean;
  children: React.ReactNode;
  sx?: object;
}) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: 1,
        borderColor: success ? "success.main" : "error.main",
        bgcolor:
          theme.palette.mode === "dark"
            ? success
              ? "rgba(46, 125, 50, 0.1)"
              : "rgba(211, 47, 47, 0.1)"
            : success
              ? "rgba(46, 125, 50, 0.05)"
              : "rgba(211, 47, 47, 0.05)",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

function SimulationResultDisplay({result}: {result: unknown[]}) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(true);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const txn = (Array.isArray(result) ? result[0] : result) as Record<
    string,
    unknown
  >;
  if (!txn) return null;

  const isSuccess = txn.success === true;
  const gasUsed = txn.gas_used as string | undefined;
  const vmStatus = txn.vm_status as string | undefined;
  const events = (txn.events as unknown[]) ?? [];
  const changes = (txn.changes as unknown[]) ?? [];

  const fullJson = JSON.stringify(result, null, 2);

  async function copyJson() {
    try {
      await navigator.clipboard.writeText(fullJson);
      setTooltipOpen(true);
      setTimeout(() => setTooltipOpen(false), TOOLTIP_TIME);
    } catch {
      // Clipboard API not available
    }
  }

  return (
    <Box sx={{mt: 3}}>
      <ResultCard success={isSuccess}>
        <Stack
          direction="row"
          spacing={1}
          sx={{alignItems: "flex-start", mb: 2}}
        >
          {isSuccess ? (
            <CheckCircle color="success" fontSize="small" />
          ) : (
            <ErrorIcon color="error" fontSize="small" />
          )}
          <Box sx={{flex: 1}}>
            <Typography
              variant="subtitle2"
              color={isSuccess ? "success.main" : "error"}
            >
              Simulation {isSuccess ? "Successful" : "Failed"}
            </Typography>
            {vmStatus && (
              <Typography
                variant="body2"
                sx={{color: "text.secondary", mt: 0.5}}
              >
                {vmStatus}
              </Typography>
            )}
          </Box>
          <StyledTooltip
            title={tooltipOpen ? "Copied!" : "Copy full response"}
            placement="top"
            open={tooltipOpen || undefined}
            disableFocusListener={tooltipOpen}
            disableHoverListener={tooltipOpen}
            disableTouchListener={tooltipOpen}
          >
            <IconButton onClick={copyJson} size="small">
              <ContentCopy fontSize="small" />
            </IconButton>
          </StyledTooltip>
        </Stack>

        <Stack direction="row" spacing={3} sx={{mb: 2}}>
          {gasUsed && (
            <Box>
              <Typography variant="caption" sx={{color: "text.secondary"}}>
                Gas Used
              </Typography>
              <Typography variant="body2" sx={{fontWeight: 600}}>
                {gasUsed}
              </Typography>
            </Box>
          )}
          <Box>
            <Typography variant="caption" sx={{color: "text.secondary"}}>
              Events
            </Typography>
            <Typography variant="body2" sx={{fontWeight: 600}}>
              {events.length}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{color: "text.secondary"}}>
              Changes
            </Typography>
            <Typography variant="body2" sx={{fontWeight: 600}}>
              {changes.length}
            </Typography>
          </Box>
        </Stack>

        <Button
          size="small"
          onClick={() => setExpanded(!expanded)}
          endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
          sx={{textTransform: "none", mb: expanded ? 1 : 0}}
        >
          {expanded ? "Hide" : "Show"} Full Response
        </Button>

        <Collapse in={expanded}>
          <Typography
            component="pre"
            sx={{
              fontFamily: "monospace",
              fontSize: 12,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              m: 0,
              p: 2,
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.03)"
                  : "rgba(0,0,0,0.02)",
              borderRadius: 1,
              maxHeight: 500,
              overflow: "auto",
            }}
          >
            {fullJson}
          </Typography>
        </Collapse>
      </ResultCard>
    </Box>
  );
}

function ScriptForm() {
  const theme = useTheme();
  const networkName = useNetworkName();
  const sdkV2Client = useSdkV2Client();
  const {connected, account} = useWallet();
  const {
    submitTransaction,
    transactionResponse,
    transactionInProcess,
    clearTransactionResponse,
  } = useSubmitTransaction();

  const [bytecode, setBytecode] = useState("");
  const [typeArgs, setTypeArgs] = useState<string[]>([]);
  const [args, setArgs] = useState<ScriptArgInput[]>([]);

  const [inputError, setInputError] = useState<string | undefined>();
  const [simulationInProcess, setSimulationInProcess] = useState(false);
  const [simulationResult, setSimulationResult] = useState<unknown[] | null>(
    null,
  );
  const [simulationError, setSimulationError] = useState<string | undefined>();

  const busy = transactionInProcess || simulationInProcess;

  function buildScriptData() {
    const normalizedBytecode = normalizeScriptBytecode(bytecode);
    const trimmedTypeArgs = typeArgs
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    const functionArguments = convertScriptFunctionArguments(args);
    return {
      bytecode: normalizedBytecode,
      typeArguments: trimmedTypeArgs,
      functionArguments,
    };
  }

  function resetResults() {
    setInputError(undefined);
    setSimulationResult(null);
    setSimulationError(undefined);
    clearTransactionResponse();
  }

  const handleSimulate = async () => {
    resetResults();

    if (!account?.address || !account?.publicKey) {
      setSimulationError("Wallet account not available for simulation");
      return;
    }

    let scriptData: ReturnType<typeof buildScriptData>;
    try {
      scriptData = buildScriptData();
    } catch (e: unknown) {
      setInputError(e instanceof Error ? e.message : "Invalid input");
      return;
    }

    setSimulationInProcess(true);
    try {
      const transaction = await sdkV2Client.transaction.build.simple({
        sender: account.address,
        data: scriptData,
      });
      const result = await sdkV2Client.transaction.simulate.simple({
        signerPublicKey: account.publicKey,
        transaction,
      });
      setSimulationResult(result as unknown[]);
    } catch (error) {
      setSimulationError(
        error instanceof Error ? error.message : "Simulation failed",
      );
    }
    setSimulationInProcess(false);
  };

  const handleExecute = async () => {
    resetResults();

    let scriptData: ReturnType<typeof buildScriptData>;
    try {
      scriptData = buildScriptData();
    } catch (e: unknown) {
      setInputError(e instanceof Error ? e.message : "Invalid input");
      return;
    }

    const payload: InputTransactionData = {data: scriptData};
    await submitTransaction(payload);
  };

  const isFunctionSuccess = !!(
    transactionResponse?.transactionSubmitted && transactionResponse?.success
  );

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        bgcolor: theme.palette.background.paper,
        borderRadius: 2,
      }}
    >
      <Stack spacing={3}>
        {/* Script bytecode */}
        <Box>
          <Typography variant="subtitle2" gutterBottom sx={{fontWeight: 600}}>
            Script Bytecode
          </Typography>
          <Typography
            variant="caption"
            sx={{color: "text.secondary", display: "block", mb: 1}}
          >
            Paste the compiled Move script bytecode as a hex string (for
            example, the contents of a compiled <code>.mv</code> file). You can
            produce this with <code>aptos move compile-script</code>.
          </Typography>
          <TextField
            value={bytecode}
            onChange={(e) => setBytecode(e.target.value)}
            placeholder="0xa11ceb0b..."
            fullWidth
            multiline
            minRows={4}
            maxRows={12}
            slotProps={{
              input: {sx: {fontFamily: "monospace", fontSize: 13}},
            }}
          />
        </Box>

        <Divider />

        {/* Type arguments */}
        <Box>
          <Stack
            direction="row"
            spacing={1}
            sx={{alignItems: "center", justifyContent: "space-between", mb: 1}}
          >
            <Typography variant="subtitle2" sx={{fontWeight: 600}}>
              Type Arguments
            </Typography>
            <Button
              size="small"
              startIcon={<AddIcon fontSize="small" />}
              onClick={() => setTypeArgs((prev) => [...prev, ""])}
              sx={{textTransform: "none"}}
            >
              Add type argument
            </Button>
          </Stack>
          {typeArgs.length === 0 ? (
            <Typography variant="caption" sx={{color: "text.secondary"}}>
              No type arguments. Add one for each generic type parameter of the
              script.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {typeArgs.map((value, i) => (
                <Stack
                  // biome-ignore lint/suspicious/noArrayIndexKey: rows identified by position
                  key={`typearg-${i}`}
                  direction="row"
                  spacing={1}
                  sx={{alignItems: "center"}}
                >
                  <TextField
                    value={value}
                    onChange={(e) =>
                      setTypeArgs((prev) =>
                        prev.map((t, idx) => (idx === i ? e.target.value : t)),
                      )
                    }
                    label={`Type argument ${i + 1}`}
                    placeholder="0x1::aptos_coin::AptosCoin"
                    fullWidth
                    size="small"
                    slotProps={{
                      input: {sx: {fontFamily: "monospace", fontSize: 13}},
                    }}
                  />
                  <IconButton
                    aria-label="Remove type argument"
                    onClick={() =>
                      setTypeArgs((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    size="small"
                  >
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
          )}
        </Box>

        <Divider />

        {/* Function arguments */}
        <Box>
          <Stack
            direction="row"
            spacing={1}
            sx={{alignItems: "center", justifyContent: "space-between", mb: 1}}
          >
            <Typography variant="subtitle2" sx={{fontWeight: 600}}>
              Arguments
            </Typography>
            <Button
              size="small"
              startIcon={<AddIcon fontSize="small" />}
              onClick={() =>
                setArgs((prev) => [
                  ...prev,
                  {type: "address", customType: "", value: ""},
                ])
              }
              sx={{textTransform: "none"}}
            >
              Add argument
            </Button>
          </Stack>
          <Typography
            variant="caption"
            sx={{color: "text.secondary", display: "block", mb: 2}}
          >
            A script has no on-chain ABI, so you must declare the type of each
            argument in the order the script expects them. Do not add the
            leading <code>&amp;signer</code> / <code>signer</code> parameters —
            they are supplied automatically by your wallet.
          </Typography>
          {args.length === 0 ? (
            <Typography variant="caption" sx={{color: "text.secondary"}}>
              No arguments.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {args.map((arg, i) => (
                <Stack
                  // biome-ignore lint/suspicious/noArrayIndexKey: rows identified by position
                  key={`arg-${i}`}
                  direction={{xs: "column", sm: "row"}}
                  spacing={1}
                  sx={{alignItems: {sm: "center"}}}
                >
                  <TextField
                    select
                    label="Type"
                    value={arg.type}
                    onChange={(e) =>
                      setArgs((prev) =>
                        prev.map((a, idx) =>
                          idx === i ? {...a, type: e.target.value} : a,
                        ),
                      )
                    }
                    size="small"
                    sx={{minWidth: 180}}
                  >
                    {SCRIPT_ARG_TYPE_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                  {arg.type === "custom" && (
                    <TextField
                      value={arg.customType ?? ""}
                      onChange={(e) =>
                        setArgs((prev) =>
                          prev.map((a, idx) =>
                            idx === i ? {...a, customType: e.target.value} : a,
                          ),
                        )
                      }
                      label="Custom type"
                      placeholder="vector<vector<u8>>"
                      size="small"
                      sx={{minWidth: 180}}
                      slotProps={{
                        input: {sx: {fontFamily: "monospace", fontSize: 13}},
                      }}
                    />
                  )}
                  <TextField
                    value={arg.value}
                    onChange={(e) =>
                      setArgs((prev) =>
                        prev.map((a, idx) =>
                          idx === i ? {...a, value: e.target.value} : a,
                        ),
                      )
                    }
                    label={`Argument ${i + 1}`}
                    placeholder={getScriptArgPlaceholder(
                      arg.type === "custom" ? (arg.customType ?? "") : arg.type,
                    )}
                    fullWidth
                    size="small"
                  />
                  <IconButton
                    aria-label="Remove argument"
                    onClick={() =>
                      setArgs((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    size="small"
                  >
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
          )}
        </Box>

        <Divider />

        {/* Actions */}
        {connected ? (
          <Box>
            <Stack direction="row" spacing={2}>
              <Button
                onClick={handleExecute}
                disabled={busy}
                variant="contained"
                color="error"
                size="large"
                sx={{minWidth: 140, height: 48, fontWeight: 600}}
              >
                {transactionInProcess ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Execute"
                )}
              </Button>
              <Button
                onClick={handleSimulate}
                disabled={busy}
                variant="outlined"
                size="large"
                sx={{minWidth: 140, height: 48, fontWeight: 600}}
              >
                {simulationInProcess ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Simulate"
                )}
              </Button>
            </Stack>
            <Typography
              variant="caption"
              sx={{color: "text.secondary", display: "block", mt: 1}}
            >
              Always <strong>Simulate</strong> first and review the output
              before you Execute.
            </Typography>

            {inputError && (
              <ResultCard success={false} sx={{mt: 3}}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{alignItems: "flex-start"}}
                >
                  <ErrorIcon color="error" fontSize="small" />
                  <Box>
                    <Typography variant="subtitle2" color="error">
                      Invalid Input
                    </Typography>
                    <Typography variant="body2" sx={{color: "text.secondary"}}>
                      {inputError}
                    </Typography>
                  </Box>
                </Stack>
              </ResultCard>
            )}

            {!transactionInProcess && transactionResponse && !inputError && (
              <ResultCard success={isFunctionSuccess} sx={{mt: 3}}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{alignItems: "flex-start"}}
                >
                  {isFunctionSuccess ? (
                    <CheckCircle color="success" fontSize="small" />
                  ) : (
                    <ErrorIcon color="error" fontSize="small" />
                  )}
                  <Box sx={{flex: 1}}>
                    <Typography
                      variant="subtitle2"
                      color={isFunctionSuccess ? "success.main" : "error"}
                    >
                      {isFunctionSuccess
                        ? "Transaction Successful"
                        : "Transaction Failed"}
                    </Typography>
                    {transactionResponse.message && (
                      <Typography
                        variant="body2"
                        sx={{color: "text.secondary", mt: 0.5}}
                      >
                        {transactionResponse.message}
                      </Typography>
                    )}
                    {transactionResponse.transactionSubmitted &&
                      transactionResponse.transactionHash && (
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{alignItems: "center", mt: 1}}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: "monospace",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {transactionResponse.transactionHash.slice(0, 20)}
                            ...
                          </Typography>
                          <Link
                            to={`/txn/${transactionResponse.transactionHash}/userTxnOverview`}
                            color="primary"
                          >
                            <Button
                              size="small"
                              variant="outlined"
                              endIcon={<OpenInNew fontSize="small" />}
                            >
                              View
                            </Button>
                          </Link>
                        </Stack>
                      )}
                  </Box>
                </Stack>
              </ResultCard>
            )}

            {!simulationInProcess && simulationResult && !inputError && (
              <SimulationResultDisplay result={simulationResult} />
            )}

            {!simulationInProcess && simulationError && !inputError && (
              <ResultCard success={false} sx={{mt: 3}}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{alignItems: "flex-start"}}
                >
                  <ErrorIcon color="error" fontSize="small" />
                  <Box>
                    <Typography variant="subtitle2" color="error">
                      Simulation Failed
                    </Typography>
                    <Typography variant="body2" sx={{color: "text.secondary"}}>
                      {simulationError}
                    </Typography>
                  </Box>
                </Stack>
              </ResultCard>
            )}
          </Box>
        ) : (
          <Stack direction="row" spacing={2} sx={{alignItems: "center"}}>
            <WalletConnector
              networkSupport={networkName}
              sortInstallableWallets={sortPetraFirst}
              modalMaxWidth="sm"
            />
            <Typography variant="body2" sx={{color: "text.secondary"}}>
              Connect wallet to simulate or execute a script
            </Typography>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}

export default function RunScriptPage() {
  return (
    <>
      <PageMetadata
        title="Run a Move Script"
        description="Advanced tool to build, simulate, and execute a raw Move script transaction on Aptos by pasting compiled script bytecode and supplying typed arguments."
        type="website"
        keywords={[
          "Move script",
          "run script",
          "script transaction",
          "bytecode",
          "simulate transaction",
          "advanced",
        ]}
        canonicalPath="/run-script"
        noIndex
      />
      <Box>
        <PageHeader />
        <Typography variant="h3" component="h1" sx={{mb: 2}}>
          Run a Move Script
        </Typography>

        <Stack spacing={2} sx={{mb: 3}}>
          <Alert severity="error" icon={<WarningAmberIcon />}>
            <AlertTitle>Advanced action — proceed with caution</AlertTitle>
            Executing a raw Move script signs and submits a transaction from
            your connected wallet. A malicious or incorrect script can{" "}
            <strong>
              transfer your assets, revoke permissions, or take other
              irreversible actions
            </strong>
            . Only run bytecode from a source you fully trust and understand.
          </Alert>
          <Alert severity="warning">
            <AlertTitle>Always simulate first</AlertTitle>
            Use <strong>Simulate</strong> before executing and{" "}
            <strong>read the simulation output carefully</strong> — check the
            status, gas used, emitted events, and especially the balance and
            resource <em>changes</em> to confirm the script does exactly what
            you expect.
          </Alert>
        </Stack>

        <ScriptForm />
      </Box>
    </>
  );
}
