import {Box, Button, Modal, Stack, Typography, useTheme} from "@mui/material";
import {ContentCopy, OpenInFull} from "@mui/icons-material";
import SyntaxHighlighter from "react-syntax-highlighter";
import {getPublicFunctionLineNumber, transformCode} from "../../../utils";
import React, {useEffect, useRef, useState} from "react";
import StyledTooltip, {
  StyledLearnMoreTooltip,
} from "../../../components/StyledTooltip";
import {
  solarizedLight,
  solarizedDark,
} from "react-syntax-highlighter/dist/esm/styles/hljs";
import {
  codeBlockColor,
  codeBlockColorRgbDark,
  codeBlockColorRgbLight,
  grey,
} from "../../../themes/colors/aptosColorPalette";
import {useParams} from "react-router-dom";
import {useLogEventWithBasic} from "../hooks/useLogEventWithBasic";

function useStartingLineNumber(sourceCode?: string) {
  const functionToHighlight = useParams().selectedFnName;

  if (!sourceCode) return 0;
  if (!functionToHighlight) return 0;

  return getPublicFunctionLineNumber(sourceCode, functionToHighlight);
}

function ExpandCode({sourceCode}: {sourceCode: string | undefined}) {
  const theme = useTheme();
  const {selectedModuleName} = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const logEvent = useLogEventWithBasic();

  const handleOpenModal = () => {
    logEvent("expand_button_clicked", selectedModuleName);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const startingLineNumber = useStartingLineNumber(sourceCode);
  const codeBoxScrollRef = useRef<any>(null);
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
          <SyntaxHighlighter
            language="rust"
            key={theme.palette.mode}
            style={
              theme.palette.mode === "light" ? solarizedLight : solarizedDark
            }
            customStyle={{
              margin: 0,
              backgroundColor:
                theme.palette.mode === "light"
                  ? codeBlockColorRgbLight
                  : codeBlockColorRgbDark,
            }}
            showLineNumbers
          >
            {sourceCode!}
          </SyntaxHighlighter>
        </Box>
      </Modal>
    </Box>
  );
}

export function Code({bytecode}: {bytecode: string}) {
  const {selectedModuleName} = useParams();
  const logEvent = useLogEventWithBasic();

  const TOOLTIP_TIME = 2000; // 2s

  const sourceCode = bytecode === "0x" ? undefined : transformCode(bytecode);

  const theme = useTheme();
  const [tooltipOpen, setTooltipOpen] = useState<boolean>(false);

  async function copyCode() {
    if (!sourceCode) return;

    await navigator.clipboard.writeText(sourceCode);
    setTooltipOpen(true);
    setTimeout(() => {
      setTooltipOpen(false);
    }, TOOLTIP_TIME);
  }

  const startingLineNumber = useStartingLineNumber(sourceCode);
  const codeBoxScrollRef = useRef<any>(null);
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
          <StyledLearnMoreTooltip text="Please be aware that this code was provided by the owner and it could be different to the real code on blockchain. We cannot verify it." />
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
            <ExpandCode sourceCode={sourceCode} />
          </Stack>
        )}
      </Stack>
      {sourceCode && (
        <Typography
          variant="body1"
          fontSize={14}
          fontWeight={400}
          marginBottom={"16px"}
          color={theme.palette.mode === "dark" ? grey[400] : grey[600]}
        >
          The source code is plain text uploaded by the deployer, which can be
          different from the actual bytecode.
        </Typography>
      )}
      {!sourceCode ? (
        <Box>
          Unfortunately, the source code cannot be shown because the package
          publisher has chosen not to make it available
        </Box>
      ) : (
        <Box
          sx={{
            maxHeight: "100vh",
            overflow: "auto",
            borderRadius: 1,
            backgroundColor: codeBlockColor,
          }}
          ref={codeBoxScrollRef}
        >
          <SyntaxHighlighter
            language="rust"
            key={theme.palette.mode}
            style={
              theme.palette.mode === "light" ? solarizedLight : solarizedDark
            }
            customStyle={{margin: 0, backgroundColor: "unset"}}
            showLineNumbers
          >
            {sourceCode}
          </SyntaxHighlighter>
        </Box>
      )}
    </Box>
  );
}
