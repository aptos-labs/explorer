import {ContentCopy, FileDownload, OpenInFull} from "@mui/icons-material";
import {
  alpha,
  Box,
  Button,
  CircularProgress,
  Modal,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import {Suspense, useEffect, useState} from "react";
import {
  CodeLoadingFallback,
  SyntaxHighlighter,
  useHighlighterStyles,
} from "../../../../components/CodeHighlighter";
import StyledTooltip, {
  StyledLearnMoreTooltip,
} from "../../../../components/StyledTooltip";
import {getSemanticColors} from "../../../../themes/colors/aptosBrandColors";
import {downloadTextFile} from "../../../../utils";
import {
  type DecompilationView,
  getDecompiledScriptCodeView,
  normalizeBytecodeHex,
} from "../../../../utils/moveDecompiler";
import {useLogEventWithBasic} from "../../../Account/hooks/useLogEventWithBasic";

type ScriptBytecodeDecompilerProps = {
  bytecodeHex: string;
};

function ExpandScriptCode({
  codeToDisplay,
}: {
  codeToDisplay: string | undefined;
}) {
  const theme = useTheme();
  const semanticColors = getSemanticColors(theme.palette.mode);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const logEvent = useLogEventWithBasic();
  const styles = useHighlighterStyles();

  return (
    <Box>
      <Button
        variant="outlined"
        onClick={() => {
          logEvent("expand_button_clicked", "transaction_script_bytecode");
          setIsModalOpen(true);
        }}
        disabled={!codeToDisplay}
        sx={{
          height: "2rem",
          width: "2rem",
          minWidth: "unset",
          borderRadius: "0.5rem",
        }}
      >
        <OpenInFull style={{height: "1.25rem", width: "1.25rem"}} />
      </Button>
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: alpha("#000000", 0.88),
              backdropFilter: "blur(4px)",
            },
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            maxHeight: "80%",
            width: "80%",
            overflowY: "auto",
            borderRadius: 1,
            backgroundColor: semanticColors.codeBlock.background,
          }}
        >
          <Suspense fallback={<CodeLoadingFallback />}>
            {styles && (
              <SyntaxHighlighter
                language="move"
                key={theme.palette.mode}
                style={
                  theme.palette.mode === "light"
                    ? styles.solarizedLight
                    : styles.solarizedDark
                }
                customStyle={{
                  margin: 0,
                  backgroundColor: semanticColors.codeBlock.backgroundRgb,
                }}
                showLineNumbers
              >
                {codeToDisplay ?? ""}
              </SyntaxHighlighter>
            )}
          </Suspense>
        </Box>
      </Modal>
    </Box>
  );
}

export default function ScriptBytecodeDecompiler({
  bytecodeHex,
}: ScriptBytecodeDecompilerProps) {
  const theme = useTheme();
  const semanticColors = getSemanticColors(theme.palette.mode);
  const styles = useHighlighterStyles();
  const logEvent = useLogEventWithBasic();
  const TOOLTIP_TIME = 2000;

  const canonicalBytecodeHex = normalizeBytecodeHex(bytecodeHex.trim());
  /** At least one byte after `0x` (two hex digits). */
  const hasBytecode = canonicalBytecodeHex.length > 3;

  const [activeView, setActiveView] =
    useState<DecompilationView>("decompiled-source");
  const [decompiledSource, setDecompiledSource] = useState<{
    bytecodeKey: string;
    code: string;
  }>();
  const [bytecodeDisassembly, setBytecodeDisassembly] = useState<{
    bytecodeKey: string;
    code: string;
  }>();
  const [decompilationError, setDecompilationError] = useState<string>();
  const [isDecompiling, setIsDecompiling] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const bytecodeKey = canonicalBytecodeHex;

  useEffect(() => {
    const missingActiveViewCode =
      activeView === "decompiled-source"
        ? !decompiledSource || decompiledSource.bytecodeKey !== bytecodeKey
        : !bytecodeDisassembly ||
          bytecodeDisassembly.bytecodeKey !== bytecodeKey;

    if (!hasBytecode || !bytecodeKey || !missingActiveViewCode) {
      return;
    }

    const currentBytecodeKey = bytecodeKey;
    let cancelled = false;

    async function runDecompilation() {
      setIsDecompiling(true);
      setDecompilationError(undefined);
      try {
        const decompilationView: DecompilationView =
          activeView === "decompiled-source"
            ? "decompiled-source"
            : "bytecode-disassembly";

        // Let loading UI render before running CPU-intensive WASM work.
        await new Promise((resolve) => setTimeout(resolve, 0));
        const result = await getDecompiledScriptCodeView(
          currentBytecodeKey,
          decompilationView,
        );
        if (cancelled) {
          return;
        }
        if (decompilationView === "decompiled-source") {
          setDecompiledSource({bytecodeKey: currentBytecodeKey, code: result});
        } else {
          setBytecodeDisassembly({
            bytecodeKey: currentBytecodeKey,
            code: result,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setDecompilationError(
            err instanceof Error ? err.message : String(err),
          );
        }
      } finally {
        if (!cancelled) {
          setIsDecompiling(false);
        }
      }
    }

    runDecompilation();
    return () => {
      cancelled = true;
    };
  }, [
    activeView,
    bytecodeDisassembly,
    bytecodeKey,
    decompiledSource,
    hasBytecode,
  ]);

  let displayedCode: string | undefined;
  if (activeView === "decompiled-source") {
    displayedCode =
      decompiledSource?.bytecodeKey === bytecodeKey
        ? decompiledSource.code
        : undefined;
  } else {
    displayedCode =
      bytecodeDisassembly?.bytecodeKey === bytecodeKey
        ? bytecodeDisassembly.code
        : undefined;
  }

  async function copyCode() {
    if (!displayedCode || typeof window === "undefined") {
      return;
    }
    await navigator.clipboard.writeText(displayedCode);
    setTooltipOpen(true);
    setTimeout(() => setTooltipOpen(false), TOOLTIP_TIME);
  }

  function downloadScriptCode() {
    if (!displayedCode || typeof document === "undefined") {
      return;
    }
    const filename =
      activeView === "decompiled-source"
        ? "script-decompiled.move"
        : "script-disassembly.txt";
    downloadTextFile(displayedCode, filename);
  }

  if (!hasBytecode) {
    return null;
  }

  return (
    <Box marginBottom={3}>
      <Stack
        direction="row"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        spacing={1}
      >
        <Stack direction="row" spacing={1} marginY="16px" alignItems="center">
          <Typography fontSize={20} fontWeight={700}>
            Script bytecode
          </Typography>
          <StyledLearnMoreTooltip text="Decompiled and disassembly views are generated from on-chain script bytecode using the Move decompiler WASM (same engine as module code pages)." />
        </Stack>
        {displayedCode && (
          <Stack direction="row" spacing={2}>
            <StyledTooltip
              title="Code copied"
              placement="right"
              open={tooltipOpen}
              disableFocusListener
              disableHoverListener
              disableTouchListener
            >
              <Button
                variant="outlined"
                onClick={() => {
                  logEvent("copy_code_button_clicked", "transaction_script");
                  copyCode();
                }}
                disabled={!displayedCode}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  height: "2rem",
                  borderRadius: "0.5rem",
                }}
              >
                <ContentCopy style={{height: "1.25rem", width: "1.25rem"}} />
                <Typography marginLeft={1} sx={{whiteSpace: "nowrap"}}>
                  copy code
                </Typography>
              </Button>
            </StyledTooltip>
            <Button
              variant="outlined"
              onClick={() => {
                logEvent("download_code_button_clicked", "transaction_script");
                downloadScriptCode();
              }}
              disabled={!displayedCode}
              sx={{
                display: "flex",
                alignItems: "center",
                height: "2rem",
                borderRadius: "0.5rem",
              }}
            >
              <FileDownload style={{height: "1.25rem", width: "1.25rem"}} />
              <Typography marginLeft={1} sx={{whiteSpace: "nowrap"}}>
                download
              </Typography>
            </Button>
            <ExpandScriptCode codeToDisplay={displayedCode} />
          </Stack>
        )}
      </Stack>
      <Stack direction="row" spacing={1} marginBottom={2}>
        <Button
          size="small"
          variant={
            activeView === "decompiled-source" ? "contained" : "outlined"
          }
          onClick={() => setActiveView("decompiled-source")}
        >
          Decompiled
        </Button>
        <Button
          size="small"
          variant={
            activeView === "bytecode-disassembly" ? "contained" : "outlined"
          }
          onClick={() => setActiveView("bytecode-disassembly")}
        >
          Disassembly
        </Button>
      </Stack>
      <Typography
        variant="body1"
        fontSize={14}
        fontWeight={400}
        marginBottom="16px"
        color={theme.palette.text.secondary}
      >
        This view is generated from on-chain bytecode using the Move decompiler
        WASM.
      </Typography>
      {isDecompiling ? (
        <Stack direction="row" spacing={1.5} alignItems="center" py={2}>
          <CircularProgress size={18} />
          <Typography variant="body2" color="text.secondary">
            Processing script bytecode...
          </Typography>
        </Stack>
      ) : decompilationError ? (
        <Box color={theme.palette.error.main}>
          Failed to process script bytecode: {decompilationError}
        </Box>
      ) : !displayedCode ? (
        <Box>Script bytecode is not available.</Box>
      ) : (
        <Box
          sx={{
            maxHeight: "70vh",
            overflow: "auto",
            borderRadius: 1,
            backgroundColor: semanticColors.codeBlock.background,
          }}
        >
          <Suspense fallback={<CodeLoadingFallback />}>
            {styles && (
              <SyntaxHighlighter
                language="move"
                key={theme.palette.mode}
                style={
                  theme.palette.mode === "light"
                    ? styles.solarizedLight
                    : styles.solarizedDark
                }
                customStyle={{margin: 0, backgroundColor: "unset"}}
                showLineNumbers
              >
                {displayedCode}
              </SyntaxHighlighter>
            )}
          </Suspense>
        </Box>
      )}
    </Box>
  );
}
