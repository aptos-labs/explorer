import {ContentCopy, FileDownload, OpenInFull} from "@mui/icons-material";
import {
  alpha,
  Box,
  Button,
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
import StyledTooltip from "../../../components/StyledTooltip";
import {getSemanticColors} from "../../../themes/colors/aptosBrandColors";
import {
  downloadTextFile,
  getPublicFunctionLineNumber,
  transformCode,
} from "../../../utils";
import {useLogEventWithBasic} from "../hooks/useLogEventWithBasic";
import {useModulesPathParams} from "../Tabs/ModulesTab/Tabs";

function useStartingLineNumber(sourceCode?: string) {
  const {selectedFnName} = useModulesPathParams();
  const functionToHighlight = selectedFnName;

  if (!sourceCode) return 0;
  if (!functionToHighlight) return 0;

  return getPublicFunctionLineNumber(sourceCode, functionToHighlight);
}

function ExpandCode({sourceCode}: {sourceCode: string | undefined}) {
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

  const startingLineNumber = useStartingLineNumber(sourceCode);
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
        disabled={!sourceCode}
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
        >
          <Suspense fallback={<CodeLoadingFallback />}>
            {styles && (
              <SyntaxHighlighter
                language="toml"
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
                {sourceCode ?? ""}
              </SyntaxHighlighter>
            )}
          </Suspense>
        </Box>
      </Modal>
    </Box>
  );
}

export function MovePackageManifest({manifest}: {manifest: string}) {
  const {selectedModuleName} = useModulesPathParams();
  const logEvent = useLogEventWithBasic();
  const styles = useHighlighterStyles();

  const TOOLTIP_TIME = 2000; // 2s

  const sourceCode = transformCode(manifest);

  const theme = useTheme();
  const semanticColors = getSemanticColors(theme.palette.mode);
  const [tooltipOpen, setTooltipOpen] = useState<boolean>(false);

  async function copyCode() {
    if (!sourceCode) return;

    await navigator.clipboard.writeText(sourceCode);
    setTooltipOpen(true);
    setTimeout(() => {
      setTooltipOpen(false);
    }, TOOLTIP_TIME);
  }

  function downloadManifest() {
    if (!sourceCode) {
      return;
    }
    downloadTextFile(sourceCode, "Move.toml", "text/plain;charset=utf-8");
  }

  const startingLineNumber = useStartingLineNumber(sourceCode);
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
        spacing={1}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{marginY: "16px", alignItems: "center"}}
        >
          <Typography sx={{fontSize: 20, fontWeight: 700}}>
            Package Manifest
          </Typography>
        </Stack>
        {sourceCode && (
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
                disabled={!sourceCode}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  height: "2rem",
                  borderRadius: "0.5rem",
                }}
              >
                <ContentCopy style={{height: "1.25rem", width: "1.25rem"}} />
                <Typography
                  sx={{
                    marginLeft: 1,
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
                downloadManifest();
              }}
              disabled={!sourceCode}
              sx={{
                display: "flex",
                alignItems: "center",
                height: "2rem",
                borderRadius: "0.5rem",
              }}
            >
              <FileDownload style={{height: "1.25rem", width: "1.25rem"}} />
              <Typography
                sx={{
                  marginLeft: 1,
                  display: "inline",
                  whiteSpace: "nowrap",
                }}
              >
                download
              </Typography>
            </Button>
            <ExpandCode sourceCode={sourceCode} />
          </Stack>
        )}
      </Stack>
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
              language="toml"
              key={theme.palette.mode}
              style={
                theme.palette.mode === "light"
                  ? styles.solarizedLight
                  : styles.solarizedDark
              }
              customStyle={{margin: 0, backgroundColor: "unset"}}
              showLineNumbers
            >
              {sourceCode}
            </SyntaxHighlighter>
          )}
        </Suspense>
      </Box>
    </Box>
  );
}
