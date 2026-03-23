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
import createElement from "react-syntax-highlighter/dist/cjs/create-element.js";
import type React from "react";
import {Suspense, useEffect, useMemo, useRef, useState} from "react";
import {
  CodeLoadingFallback,
  SyntaxHighlighter,
  useHighlighterStyles,
} from "../../../components/CodeHighlighter";
import JsonViewCard from "../../../components/IndividualPageContent/JsonViewCard";
import StyledTooltip, {
  StyledLearnMoreTooltip,
} from "../../../components/StyledTooltip";
import {useNavigate} from "../../../routing";
import type {Types} from "~/types/aptos";
import {
  type DecompilationView,
  getDecompiledCodeView,
} from "../../../utils/moveDecompiler";
import {getSemanticColors} from "../../../themes/colors/aptosBrandColors";
import {
  downloadTextFile,
  getPublicFunctionLineNumber,
  sanitizeDownloadFilename,
  transformCode,
} from "../../../utils";
import {
  injectMoveCodeLinksInHighlightRows,
  MOVE_CODE_FN_LINK_DATA_ATTR,
  type MoveCodeLinkContext,
} from "../../../utils/moveCodeNavigation";
import {useLogEventWithBasic} from "../hooks/useLogEventWithBasic";
import {useModulesPathParams} from "../Tabs/ModulesTab/Tabs";

function defaultSyntaxHighlighterRenderer({
  rows,
  stylesheet,
  useInlineStyles,
}: {
  rows: Parameters<typeof injectMoveCodeLinksInHighlightRows>[0];
  stylesheet: Record<string, React.CSSProperties>;
  useInlineStyles: boolean;
}) {
  return rows.map((node, i) =>
    createElement({
      node,
      stylesheet,
      useInlineStyles,
      key: `code-segment-${i}`,
    }),
  );
}

function useMoveCodeSyntaxRenderer(
  codeLinkContext: MoveCodeLinkContext | undefined,
) {
  return useMemo(() => {
    if (!codeLinkContext) {
      return undefined;
    }
    return function moveCodeRenderer({
      rows,
      stylesheet,
      useInlineStyles,
    }: {
      rows: Parameters<typeof injectMoveCodeLinksInHighlightRows>[0];
      stylesheet: Record<string, React.CSSProperties>;
      useInlineStyles: boolean;
    }) {
      const linkedRows = injectMoveCodeLinksInHighlightRows(
        rows,
        codeLinkContext,
      );
      return defaultSyntaxHighlighterRenderer({
        rows: linkedRows,
        stylesheet,
        useInlineStyles,
      });
    };
  }, [codeLinkContext]);
}

function useMoveCodeQualifiedLinkHandlers(
  codeLinkContext: MoveCodeLinkContext | undefined,
) {
  const navigate = useNavigate();
  return useMemo(() => {
    if (!codeLinkContext) {
      return {};
    }
    const attrSelector = `[${MOVE_CODE_FN_LINK_DATA_ATTR}]`;

    function activateMoveLink(
      el: HTMLElement,
      modifiers: {ctrlKey?: boolean; metaKey?: boolean},
    ) {
      const to = el.getAttribute(MOVE_CODE_FN_LINK_DATA_ATTR);
      if (!to) {
        return;
      }
      if (modifiers.ctrlKey || modifiers.metaKey) {
        const search =
          typeof window !== "undefined" ? window.location.search : "";
        window.open(
          `${window.location.origin}${to}${search}`,
          "_blank",
          "noopener,noreferrer",
        );
        return;
      }
      navigate({to});
    }

    const onClick = (e: React.MouseEvent<HTMLElement>) => {
      const el = (e.target as HTMLElement).closest(
        attrSelector,
      ) as HTMLElement | null;
      if (!el) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      activateMoveLink(el, e);
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key !== "Enter" && e.key !== " ") {
        return;
      }
      const el = (e.target as HTMLElement).closest(
        attrSelector,
      ) as HTMLElement | null;
      if (!el) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      activateMoveLink(el, e);
    };

    return {onClick, onKeyDown};
  }, [codeLinkContext, navigate]);
}

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
  | "bytecode-disassembly"
  | "abi";

type BytecodeViewState = {
  bytecodeKey: string;
  code: string;
};

function moduleCodeDownloadFilename(
  moduleName: string | undefined,
  activeView: CodeView,
): string {
  const base = sanitizeDownloadFilename(moduleName ?? "module");
  if (activeView === "published-source") {
    return `${base}.move`;
  }
  if (activeView === "decompiled-source") {
    return `${base}-decompiled.move`;
  }
  return `${base}-disassembly.txt`;
}

function ExpandCode({
  codeToDisplay,
  startingLineNumber,
  moveCodeRenderer,
  moveCodeLinkHandlers,
}: {
  codeToDisplay: string | undefined;
  startingLineNumber: number;
  moveCodeRenderer?: ReturnType<typeof useMoveCodeSyntaxRenderer>;
  moveCodeLinkHandlers?: ReturnType<typeof useMoveCodeQualifiedLinkHandlers>;
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
    if (!isModalOpen) {
      return;
    }

    if (codeBoxScrollRef.current) {
      codeBoxScrollRef.current.scrollTop =
        LINE_HEIGHT_IN_PX * startingLineNumber;
    }
  }, [isModalOpen, startingLineNumber]);

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
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
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
          ref={codeBoxScrollRef}
          {...moveCodeLinkHandlers}
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
                {...(moveCodeRenderer ? {renderer: moveCodeRenderer} : {})}
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

export type CodeModuleQueryProps = {
  address: string;
  data: Types.MoveModuleBytecode | undefined;
  isLoading: boolean;
  isSuccess: boolean;
};

export function Code({
  sourceBytecode,
  moduleBytecode,
  moduleQuery,
  codeLinkContext,
}: {
  sourceBytecode?: string;
  moduleBytecode?: string;
  moduleQuery?: CodeModuleQueryProps;
  /** When set, `module::function` and `0x..::module::function` in source become links to the Code tab. */
  codeLinkContext?: MoveCodeLinkContext;
}) {
  const {selectedModuleName} = useModulesPathParams();
  const logEvent = useLogEventWithBasic();
  const moveCodeRenderer = useMoveCodeSyntaxRenderer(codeLinkContext);
  const moveCodeLinkHandlers =
    useMoveCodeQualifiedLinkHandlers(codeLinkContext);
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
  const [decompiledSource, setDecompiledSource] = useState<BytecodeViewState>();
  const [bytecodeDisassembly, setBytecodeDisassembly] =
    useState<BytecodeViewState>();
  const [decompilationError, setDecompilationError] = useState<string>();
  const [isDecompiling, setIsDecompiling] = useState(false);
  const moduleBytecodeKey = moduleBytecode?.toLowerCase();

  useEffect(() => {
    if (!hasPublishedSourceCode && hasModuleBytecode) {
      setActiveView("decompiled-source");
    }
  }, [hasPublishedSourceCode, hasModuleBytecode]);

  useEffect(() => {
    if (activeView === "abi" && !moduleQuery) {
      setActiveView(
        hasPublishedSourceCode ? "published-source" : "decompiled-source",
      );
    }
  }, [activeView, moduleQuery, hasPublishedSourceCode]);

  useEffect(() => {
    const missingActiveViewCode =
      activeView === "decompiled-source"
        ? !decompiledSource ||
          decompiledSource.bytecodeKey !== moduleBytecodeKey
        : activeView === "bytecode-disassembly"
          ? !bytecodeDisassembly ||
            bytecodeDisassembly.bytecodeKey !== moduleBytecodeKey
          : false;

    if (
      !hasModuleBytecode ||
      !moduleBytecodeKey ||
      activeView === "published-source" ||
      activeView === "abi" ||
      !missingActiveViewCode
    ) {
      return;
    }

    const currentModuleBytecodeKey = moduleBytecodeKey;
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
        const result = await getDecompiledCodeView(
          currentModuleBytecodeKey,
          decompilationView,
        );
        if (!cancelled) {
          if (decompilationView === "decompiled-source") {
            setDecompiledSource({
              bytecodeKey: currentModuleBytecodeKey,
              code: result,
            });
          } else {
            setBytecodeDisassembly({
              bytecodeKey: currentModuleBytecodeKey,
              code: result,
            });
          }
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
  }, [
    activeView,
    bytecodeDisassembly,
    decompiledSource,
    hasModuleBytecode,
    moduleBytecodeKey,
  ]);

  let displayedCode: string | undefined;
  if (activeView === "published-source") {
    displayedCode = publishedSourceCode;
  } else if (activeView === "decompiled-source") {
    displayedCode =
      decompiledSource?.bytecodeKey === moduleBytecodeKey
        ? decompiledSource?.code
        : undefined;
  } else {
    displayedCode =
      bytecodeDisassembly?.bytecodeKey === moduleBytecodeKey
        ? bytecodeDisassembly?.code
        : undefined;
  }

  const startingLineNumber = useStartingLineNumber(
    activeView === "published-source" ? displayedCode : undefined,
  );

  async function copyCode() {
    if (!displayedCode) return;
    if (typeof window === "undefined") return; // Skip during SSR

    await navigator.clipboard.writeText(displayedCode);
    setTooltipOpen(true);
    setTimeout(() => {
      setTooltipOpen(false);
    }, TOOLTIP_TIME);
  }

  function downloadCode() {
    if (!displayedCode) {
      return;
    }
    downloadTextFile(
      displayedCode,
      moduleCodeDownloadFilename(selectedModuleName, activeView),
    );
  }

  const codeBoxScrollRef = useRef<{scrollTop: number} | null>(null);
  const LINE_HEIGHT_IN_PX = 24;
  useEffect(() => {
    if (codeBoxScrollRef.current) {
      codeBoxScrollRef.current.scrollTop =
        LINE_HEIGHT_IN_PX * startingLineNumber;
    }
  }, [startingLineNumber]);

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
            <Button
              variant="outlined"
              onClick={() => {
                logEvent("download_code_button_clicked", selectedModuleName);
                downloadCode();
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
              <Typography
                marginLeft={1}
                sx={{
                  display: "inline",
                  whiteSpace: "nowrap",
                }}
              >
                download
              </Typography>
            </Button>
            <ExpandCode
              codeToDisplay={displayedCode}
              startingLineNumber={startingLineNumber}
              moveCodeRenderer={moveCodeRenderer}
              moveCodeLinkHandlers={moveCodeLinkHandlers}
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
        {moduleQuery && (
          <Button
            size="small"
            variant={activeView === "abi" ? "contained" : "outlined"}
            onClick={() => setActiveView("abi")}
          >
            ABI
          </Button>
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
      {activeView !== "published-source" &&
        activeView !== "abi" &&
        (activeView === "decompiled-source" ||
          activeView === "bytecode-disassembly") && (
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
      {activeView === "abi" && moduleQuery && (
        <Typography
          variant="body1"
          fontSize={14}
          fontWeight={400}
          marginBottom={"16px"}
          color={theme.palette.text.secondary}
        >
          Module ABI metadata returned by the node for this on-chain module.
        </Typography>
      )}
      {activeView === "abi" && moduleQuery ? (
        moduleQuery.isSuccess ? (
          <JsonViewCard data={moduleQuery.data?.abi} />
        ) : (
          <Stack direction="row" spacing={1.5} alignItems="center" py={2}>
            <CircularProgress size={18} />
            <Typography variant="body2" color="text.secondary">
              Loading module ABI...
            </Typography>
          </Stack>
        )
      ) : !hasPublishedSourceCode && !hasModuleBytecode ? (
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
          {...moveCodeLinkHandlers}
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
                {...(moveCodeRenderer ? {renderer: moveCodeRenderer} : {})}
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
