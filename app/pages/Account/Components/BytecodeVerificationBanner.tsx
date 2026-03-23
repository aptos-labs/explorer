import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
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

function StepRow({step}: {step: VerificationStep}) {
  const theme = useTheme();
  const semanticColors = getSemanticColors(theme.palette.mode);
  const iconSx = {fontSize: 16};

  return (
    <Stack direction="row" spacing={1} alignItems="flex-start">
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
      <Box sx={{minWidth: 0}}>
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
              maxHeight: 60,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {step.detail}
          </Typography>
        )}
      </Box>
    </Stack>
  );
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
      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
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
        <Stack spacing={1} sx={{mt: 2}}>
          {steps.map((step) => (
            <StepRow key={step.label} step={step} />
          ))}
        </Stack>
      )}

      {showResult && result.error && (
        <Typography
          variant="body2"
          color="error"
          sx={{mt: 1.5, wordBreak: "break-word"}}
        >
          {result.error}
        </Typography>
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
    </Box>
  );
}
