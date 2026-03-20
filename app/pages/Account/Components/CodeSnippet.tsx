import {ContentCopy, OpenInFull} from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Modal,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import {Suspense, useEffect, useRef, useState} from "react";
import {
  CodeLoadingFallback,
  SyntaxHighlighter,
  useHighlighterStyles,
} from "../../../components/CodeHighlighter";
import StyledTooltip, {
  StyledLearnMoreTooltip,
} from "../../../components/StyledTooltip";
import {
  type DecompilationResult,
  decompileModuleBytecode,
} from "../../../utils/moveDecompiler";
import {getSemanticColors} from "../../../themes/colors/aptosBrandColors";
import {getPublicFunctionLineNumber, transformCode} from "../../../utils";
import {useLogEventWithBasic} from "../hooks/useLogEventWithBasic";
import {useModulesPathParams} from "../Tabs/ModulesTab/Tabs";

function useStartingLineNumber(sourceCode?: string) {
  const {selectedFnName} = useModulesPathParams();
  const functionToHighlight = selectedFnName;

  if (!sourceCode) return 0;
  if (!functionToHighlight) return 0;

  return getPublicFunctionLineNumber(sourceCode, functionToHighlight);
}

type CodeView =
  | "published-source"
  | "decompiled-source"
  | "bytecode-disassembly";

function ExpandCode({
  codeToDisplay,
  startingLineNumber,
}: {
  codeToDisplay: string | undefined;
  startingLineNumber: number;
}) {
  const theme = useTheme();
  const semanticColors = getSemanticColors(theme.palette.mode);
  const {selectedModuleName} = useModulesPathParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const logEvent = useLogEventWithBasic();
  const styles = useHighlighterStyles();

  const handleOpenModal = () => {
    logEvent("expand_button_clicked", selectedModuleName);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const codeBoxScrollRef = useRef<{scrollTop: number} | null>(null);
  const LINE_HEIGHT_IN_PX = 24;
  useEffect(() => {
    if (codeBoxScrollRef.current) {
      codeBoxScrollRef.current.scrollTop =
        LINE_HEIGHT_IN_PX * startingLineNumber;
    }
  });

  return (
    <Box>
      <Button
        variant="outlined"
        onClick={handleOpenModal}
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
      <Modal open={isModalOpen} onClose={handleCloseModal}>
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
          }}
          ref={codeBoxScrollRef}
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

export function Code({
  sourceBytecode,
  moduleBytecode,
}: {
  sourceBytecode?: string;
  moduleBytecode?: string;
}) {
  const {selectedModuleName} = useModulesPathParams();
  const logEvent = useLogEventWithBasic();
  const styles = useHighlighterStyles();

  const TOOLTIP_TIME = 2000; // 2s

  const publishedSourceCode =
    sourceBytecode && sourceBytecode !== "0x"
      ? transformCode(sourceBytecode)
      : undefined;
  const hasPublishedSourceCode = !!publishedSourceCode;
  const hasModuleBytecode =
    typeof moduleBytecode === "string" && moduleBytecode !== "0x";

  const theme = useTheme();
  const semanticColors = getSemanticColors(theme.palette.mode);
  const [tooltipOpen, setTooltipOpen] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<CodeView>(() =>
    hasPublishedSourceCode ? "published-source" : "decompiled-source",
  );
  const [decompilationResult, setDecompilationResult] =
    useState<DecompilationResult | null>(null);
  const [decompilationError, setDecompilationError] = useState<string>();
  const [isDecompiling, setIsDecompiling] = useState(false);

  useEffect(() => {
    if (!hasPublishedSourceCode && hasModuleBytecode) {
      setActiveView("decompiled-source");
    }
  }, [hasPublishedSourceCode, hasModuleBytecode]);

  useEffect(() => {
    if (moduleBytecode) {
      setDecompilationResult(null);
      setDecompilationError(undefined);
      return;
    }

    setDecompilationResult(null);
    setDecompilationError(undefined);
  }, [moduleBytecode]);

  useEffect(() => {
    if (
      !hasModuleBytecode ||
      !moduleBytecode ||
      decompilationResult ||
      activeView === "published-source"
    ) {
      return;
    }

    const moduleBytecodeHex = moduleBytecode;
    if (!moduleBytecodeHex) {
      return;
    }

    let cancelled = false;

    async function runDecompilation() {
      setIsDecompiling(true);
      setDecompilationError(undefined);

      try {
        const result = await decompileModuleBytecode(moduleBytecodeHex);
        if (!cancelled) {
          setDecompilationResult(result);
        }
      } catch (error) {
        if (!cancelled) {
          setDecompilationError(
            error instanceof Error
              ? error.message
              : "Failed to decompile module",
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
  }, [activeView, decompilationResult, hasModuleBytecode, moduleBytecode]);

  let displayedCode: string | undefined;
  if (activeView === "published-source") {
    displayedCode = publishedSourceCode;
  } else if (activeView === "decompiled-source") {
    displayedCode = decompilationResult?.decompiledSource;
  } else {
    displayedCode = decompilationResult?.disassembly;
  }

  const startingLineNumber = useStartingLineNumber(
    activeView === "published-source" ? displayedCode : undefined,
  );

  async function copyCode() {
    if (!displayedCode) return;

    await navigator.clipboard.writeText(displayedCode);
    setTooltipOpen(true);
    setTimeout(() => {
      setTooltipOpen(false);
    }, TOOLTIP_TIME);
  }

  const codeBoxScrollRef = useRef<{scrollTop: number} | null>(null);
  const LINE_HEIGHT_IN_PX = 24;
  useEffect(() => {
    if (codeBoxScrollRef.current) {
      codeBoxScrollRef.current.scrollTop =
        LINE_HEIGHT_IN_PX * startingLineNumber;
    }
  });

  return (
    <Box>
      <Stack
        direction="row"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        spacing={1}
      >
        <Stack
          direction="row"
          spacing={1}
          marginY={"16px"}
          alignItems={"center"}
        >
          <Typography fontSize={20} fontWeight={700}>
            Code
          </Typography>
          <StyledLearnMoreTooltip text="Published source can differ from on-chain bytecode. Decompiled output is generated directly from on-chain bytecode with the Move decompiler WASM." />
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
                  logEvent("copy_code_button_clicked", selectedModuleName);
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
                <Typography
                  marginLeft={1}
                  sx={{
                    display: "inline",
                    whiteSpace: "nowrap",
                  }}
                >
                  copy code
                </Typography>
              </Button>
            </StyledTooltip>
            <ExpandCode
              codeToDisplay={displayedCode}
              startingLineNumber={startingLineNumber}
            />
          </Stack>
        )}
      </Stack>
      <Stack direction="row" spacing={1} marginBottom={2}>
        {hasPublishedSourceCode && (
          <Button
            size="small"
            variant={
              activeView === "published-source" ? "contained" : "outlined"
            }
            onClick={() => setActiveView("published-source")}
          >
            Published Source
          </Button>
        )}
        {hasModuleBytecode && (
          <>
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
          </>
        )}
      </Stack>
      {activeView === "published-source" && displayedCode && (
        <Typography
          variant="body1"
          fontSize={14}
          fontWeight={400}
          marginBottom={"16px"}
          color={theme.palette.text.secondary}
        >
          The source code is plain text uploaded by the deployer, which can be
          different from the actual bytecode.
        </Typography>
      )}
      {activeView !== "published-source" && (
        <Typography
          variant="body1"
          fontSize={14}
          fontWeight={400}
          marginBottom={"16px"}
          color={theme.palette.text.secondary}
        >
          This view is generated from on-chain bytecode using the Move
          decompiler WASM.
        </Typography>
      )}
      {!hasPublishedSourceCode && !hasModuleBytecode ? (
        <Box>
          This module does not expose published source or bytecode for
          decompilation.
        </Box>
      ) : activeView !== "published-source" && isDecompiling ? (
        <Stack direction="row" spacing={1.5} alignItems="center" py={2}>
          <CircularProgress size={18} />
          <Typography variant="body2" color="text.secondary">
            Decompiling module bytecode...
          </Typography>
        </Stack>
      ) : activeView !== "published-source" && decompilationError ? (
        <Box color={theme.palette.error.main}>
          Failed to decompile module bytecode: {decompilationError}
        </Box>
      ) : !displayedCode ? (
        <Box>
          {activeView === "published-source"
            ? "Published source is not available for this module."
            : "Module bytecode is not available for decompilation."}
        </Box>
      ) : (
        <Box
          sx={{
            maxHeight: "100vh",
            overflow: "auto",
            borderRadius: 1,
            backgroundColor: semanticColors.codeBlock.background,
          }}
          ref={codeBoxScrollRef}
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
