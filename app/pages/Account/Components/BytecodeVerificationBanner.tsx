import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import {
  Box,
  Button,
  ButtonBase,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Modal,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import {useCallback, useRef, useState} from "react";
import type {PackageMetadata} from "../../../api/hooks/useGetAccountResource";
import {getSemanticColors} from "../../../themes/colors/aptosBrandColors";
import type {
  BytecodeVerificationResult,
  VerificationStep,
} from "../../../utils/bytecodeVerification";

type Props = {
  moduleBytecodeHex: string | undefined;
  publishedSourceHex: string | undefined;
  allPackages?: PackageMetadata[];
  moduleAddress?: string;
};

function ErrorDetailModal({
  step,
  open,
  onClose,
}: {
  step: VerificationStep;
  open: boolean;
  onClose: () => void;
}) {
  const theme = useTheme();
  const semanticColors = getSemanticColors(theme.palette.mode);
  const errors = step.rawErrors ?? [];

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: {xs: "95%", sm: "80%", md: "60%"},
          maxHeight: "80vh",
          bgcolor: semanticColors.background.elevated,
          borderRadius: 2,
          boxShadow: 24,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{px: 3, py: 2}}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <ErrorOutlineIcon
              sx={{fontSize: 20, color: semanticColors.status.error}}
            />
            <Typography variant="subtitle1" fontWeight={700}>
              {step.label}
            </Typography>
          </Stack>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Divider />

        <Box sx={{px: 3, py: 2}}>
          <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
            {step.detail}
          </Typography>
        </Box>

        {errors.length > 0 && (
          <>
            <Divider />
            <Box
              sx={{
                px: 3,
                py: 2,
                overflow: "auto",
                flex: 1,
                maxHeight: "50vh",
              }}
            >
              <Typography variant="body2" fontWeight={600} sx={{mb: 1}}>
                {errors.length} error{errors.length !== 1 ? "s" : ""}
              </Typography>
              <Stack
                spacing={0}
                sx={{
                  fontFamily: "monospace",
                  fontSize: 12,
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {errors.map((err, i) => (
                  <Typography
                    key={`${i}-${err.slice(0, 30)}`}
                    variant="body2"
                    sx={{
                      fontFamily: "monospace",
                      fontSize: 12,
                      py: 0.25,
                      color: err.toLowerCase().startsWith("warning")
                        ? semanticColors.status.warning
                        : semanticColors.status.error,
                    }}
                  >
                    {err}
                  </Typography>
                ))}
              </Stack>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
}

function StepRow({
  step,
  onClickError,
}: {
  step: VerificationStep;
  onClickError?: () => void;
}) {
  const theme = useTheme();
  const semanticColors = getSemanticColors(theme.palette.mode);
  const iconSx = {fontSize: 16};
  const isClickable = step.status === "error" && !!step.rawErrors?.length;

  const content = (
    <Stack
      direction="row"
      spacing={1}
      alignItems="flex-start"
      sx={{width: "100%"}}
    >
      <Box sx={{mt: "2px", width: 16, height: 16, flexShrink: 0}}>
        {step.status === "pending" && (
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: semanticColors.border.light,
              mt: "4px",
              ml: "4px",
            }}
          />
        )}
        {step.status === "running" && <CircularProgress size={16} />}
        {step.status === "done" && (
          <CheckCircleOutlineIcon
            sx={{...iconSx, color: semanticColors.status.success}}
          />
        )}
        {step.status === "error" && (
          <ErrorOutlineIcon
            sx={{...iconSx, color: semanticColors.status.error}}
          />
        )}
      </Box>
      <Box sx={{minWidth: 0, flex: 1, textAlign: "left"}}>
        <Typography
          variant="body2"
          fontWeight={600}
          color={step.status === "pending" ? "text.disabled" : "text.primary"}
        >
          {step.label}
        </Typography>
        {step.detail && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              wordBreak: "break-word",
              maxHeight: 40,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {step.detail}
          </Typography>
        )}
        {isClickable && (
          <Typography
            variant="caption"
            sx={{
              color: semanticColors.link.main,
              cursor: "pointer",
              "&:hover": {textDecoration: "underline"},
            }}
          >
            Click for details
          </Typography>
        )}
      </Box>
    </Stack>
  );

  if (isClickable) {
    return (
      <ButtonBase
        onClick={onClickError}
        sx={{
          display: "block",
          width: "100%",
          borderRadius: 1,
          p: 0.5,
          "&:hover": {bgcolor: "action.hover"},
        }}
      >
        {content}
      </ButtonBase>
    );
  }

  return <Box sx={{p: 0.5}}>{content}</Box>;
}

export default function BytecodeVerificationBanner({
  moduleBytecodeHex,
  publishedSourceHex,
  allPackages,
  moduleAddress,
}: Props) {
  const theme = useTheme();
  const semanticColors = getSemanticColors(theme.palette.mode);
  const [result, setResult] = useState<BytecodeVerificationResult | null>(null);
  const [liveSteps, setLiveSteps] = useState<VerificationStep[] | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [modalStep, setModalStep] = useState<VerificationStep | null>(null);
  const cancelledRef = useRef(false);

  const hasSource =
    !!publishedSourceHex &&
    publishedSourceHex !== "0x" &&
    publishedSourceHex.length > 2;

  const canVerify =
    !!moduleBytecodeHex && moduleBytecodeHex !== "0x" && hasSource;

  const runVerification = useCallback(async () => {
    if (!moduleBytecodeHex || !publishedSourceHex) return;
    cancelledRef.current = false;
    setIsRunning(true);
    setResult(null);
    setLiveSteps(null);

    try {
      const {verifyModuleBytecode} = await import(
        "../../../utils/bytecodeVerification"
      );
      const res = await verifyModuleBytecode({
        moduleBytecodeHex,
        publishedSourceHex,
        allPackages,
        moduleAddress,
        onProgress: (steps) => {
          if (!cancelledRef.current) setLiveSteps([...steps]);
        },
      });
      if (!cancelledRef.current) {
        setResult(res);
        setLiveSteps(null);
      }
    } catch {
      if (!cancelledRef.current) {
        setResult({
          status: "error",
          steps: [],
          error: "Unexpected error during verification",
        });
      }
    } finally {
      if (!cancelledRef.current) setIsRunning(false);
    }
  }, [moduleBytecodeHex, publishedSourceHex, allPackages, moduleAddress]);

  if (!moduleBytecodeHex || moduleBytecodeHex === "0x") return null;

  const steps = result?.steps ?? liveSteps;
  const showResult = !!result && !isRunning;

  return (
    <Box
      sx={{
        border: `1px solid ${semanticColors.border.light}`,
        borderRadius: 2,
        mb: 2,
        p: 2,
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        flexWrap="wrap"
        useFlexGap
      >
        <Button
          size="small"
          variant="outlined"
          onClick={runVerification}
          disabled={!canVerify || isRunning}
          startIcon={
            isRunning ? (
              <CircularProgress size={14} />
            ) : (
              <VerifiedUserOutlinedIcon sx={{fontSize: 16}} />
            )
          }
          sx={{textTransform: "none", borderRadius: 1.5}}
        >
          {isRunning ? "Verifying…" : result ? "Re-verify" : "Verify Bytecode"}
        </Button>

        <Chip
          label="Beta"
          size="small"
          variant="outlined"
          color="warning"
          sx={{height: 22, fontSize: 11}}
        />

        {!hasSource && (
          <Typography variant="body2" color="text.secondary">
            No published source — verification unavailable
          </Typography>
        )}

        {showResult && result.status === "verified" && (
          <Chip
            icon={<CheckCircleOutlineIcon sx={{fontSize: 14}} />}
            label="Source verified"
            size="small"
            color="success"
            variant="outlined"
            sx={{height: 24, fontSize: 12}}
          />
        )}
        {showResult && result.status === "mismatch" && (
          <Chip
            icon={<ErrorOutlineIcon sx={{fontSize: 14}} />}
            label="Bytecode mismatch"
            size="small"
            color="warning"
            variant="outlined"
            sx={{height: 24, fontSize: 12}}
          />
        )}
        {showResult && result.status === "error" && (
          <Chip
            icon={<ErrorOutlineIcon sx={{fontSize: 14}} />}
            label="Verification failed"
            size="small"
            color="error"
            variant="outlined"
            sx={{height: 24, fontSize: 12}}
          />
        )}
      </Stack>

      {steps && steps.length > 0 && (
        <Stack spacing={0.5} sx={{mt: 2}}>
          {steps.map((step) => (
            <StepRow
              key={step.label}
              step={step}
              onClickError={() => setModalStep(step)}
            />
          ))}
        </Stack>
      )}

      <Typography
        variant="caption"
        color="text.disabled"
        sx={{display: "block", mt: steps ? 1.5 : 1}}
      >
        Bytecode verification is in beta and may produce incorrect results. It
        decompiles on-chain bytecode, recompiles both decompiled and published
        source, and compares the outputs.
      </Typography>

      {modalStep && (
        <ErrorDetailModal
          step={modalStep}
          open
          onClose={() => setModalStep(null)}
        />
      )}
    </Box>
  );
}
