import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  CircularProgress,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import {useEffect, useState} from "react";
import {getSemanticColors} from "../../../themes/colors/aptosBrandColors";
import type {
  BytecodeVerificationResult,
  VerificationStatus,
} from "../../../utils/bytecodeVerification";

type Props = {
  moduleBytecodeHex: string | undefined;
  publishedSourceHex: string | undefined;
};

function useVerification(
  moduleBytecodeHex: string | undefined,
  publishedSourceHex: string | undefined,
) {
  const [result, setResult] = useState<BytecodeVerificationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!moduleBytecodeHex || moduleBytecodeHex === "0x") {
      setResult(null);
      return;
    }

    let cancelled = false;
    setIsRunning(true);

    (async () => {
      try {
        const {verifyModuleBytecode} = await import(
          "../../../utils/bytecodeVerification"
        );
        const res = await verifyModuleBytecode({
          moduleBytecodeHex,
          publishedSourceHex,
        });
        if (!cancelled) setResult(res);
      } catch {
        if (!cancelled) {
          setResult({
            status: "error",
            statusLabel: "Verification error",
            checks: [],
            metadata: null,
            namedAddresses: [],
            isPreMove2: false,
            compilerAvailable: false,
            error: "Unexpected error during verification",
          });
        }
      } finally {
        if (!cancelled) setIsRunning(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [moduleBytecodeHex, publishedSourceHex]);

  return {result, isRunning};
}

function statusColor(
  status: VerificationStatus,
  semanticColors: ReturnType<typeof getSemanticColors>,
) {
  switch (status) {
    case "verified":
      return semanticColors.status.success;
    case "partial":
      return semanticColors.status.info;
    case "unverified":
      return semanticColors.status.warning;
    case "error":
      return semanticColors.status.error;
  }
}

function StatusIcon({status}: {status: VerificationStatus}) {
  const sx = {fontSize: 18};
  switch (status) {
    case "verified":
      return <CheckCircleOutlineIcon sx={sx} />;
    case "partial":
      return <InfoOutlinedIcon sx={sx} />;
    case "unverified":
      return <WarningAmberIcon sx={sx} />;
    case "error":
      return <ErrorOutlineIcon sx={sx} />;
  }
}

export default function BytecodeVerificationBanner({
  moduleBytecodeHex,
  publishedSourceHex,
}: Props) {
  const theme = useTheme();
  const semanticColors = getSemanticColors(theme.palette.mode);
  const {result, isRunning} = useVerification(
    moduleBytecodeHex,
    publishedSourceHex,
  );

  if (!moduleBytecodeHex || moduleBytecodeHex === "0x") return null;

  if (isRunning && !result) {
    return (
      <Stack direction="row" spacing={1} alignItems="center" py={1}>
        <CircularProgress size={16} />
        <Typography variant="body2" color="text.secondary">
          Verifying bytecode…
        </Typography>
      </Stack>
    );
  }

  if (!result) return null;

  const color = statusColor(result.status, semanticColors);

  return (
    <Accordion
      disableGutters
      elevation={0}
      sx={{
        border: `1px solid ${color}`,
        borderRadius: "8px !important",
        "&::before": {display: "none"},
        backgroundColor: "transparent",
        mb: 2,
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{minHeight: 44, px: 2, py: 0}}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <StatusIcon status={result.status} />
          <Typography variant="body2" fontWeight={600} color={color}>
            {result.statusLabel}
          </Typography>
          {result.metadata && (
            <Chip
              label={`Bytecode v${result.metadata.version}`}
              size="small"
              variant="outlined"
              sx={{height: 22, fontSize: 11}}
            />
          )}
          {result.isPreMove2 && (
            <Chip
              label="Pre-Move 2"
              size="small"
              color="warning"
              variant="outlined"
              sx={{height: 22, fontSize: 11}}
            />
          )}
          <Chip
            label={
              result.compilerAvailable
                ? "Compiler loaded"
                : "Compiler not loaded"
            }
            size="small"
            variant="outlined"
            sx={{
              height: 22,
              fontSize: 11,
              color: result.compilerAvailable
                ? semanticColors.status.success
                : semanticColors.text.disabled,
              borderColor: result.compilerAvailable
                ? semanticColors.status.success
                : semanticColors.border.light,
            }}
          />
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{px: 2, pt: 0, pb: 2}}>
        <Stack spacing={1.5}>
          {result.checks.map((check) => (
            <Stack
              key={check.label}
              direction="row"
              spacing={1}
              alignItems="flex-start"
            >
              <Box sx={{mt: "2px"}}>
                {check.passed ? (
                  <CheckCircleOutlineIcon
                    sx={{
                      fontSize: 16,
                      color: semanticColors.status.success,
                    }}
                  />
                ) : (
                  <ErrorOutlineIcon
                    sx={{
                      fontSize: 16,
                      color: semanticColors.status.warning,
                    }}
                  />
                )}
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {check.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {check.detail}
                </Typography>
              </Box>
            </Stack>
          ))}

          {result.metadata && (
            <Box>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{mt: 1, mb: 0.5}}
              >
                Module metadata
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                component="div"
              >
                <Box component="span" sx={{fontFamily: "monospace"}}>
                  {result.metadata.address
                    ? `${result.metadata.address}::${result.metadata.name}`
                    : result.metadata.name}
                </Box>
                {" — "}
                {result.metadata.functionCount} functions,{" "}
                {result.metadata.structCount} structs
              </Typography>
            </Box>
          )}

          {result.namedAddresses.length > 0 && (
            <Box>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{mt: 0.5, mb: 0.5}}
              >
                Named addresses (extracted from bytecode)
              </Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {result.namedAddresses.map((na) => (
                  <Chip
                    key={na.address}
                    label={`${na.name} = ${na.address.slice(0, 10)}…`}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontFamily: "monospace",
                      fontSize: 11,
                      height: 24,
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {result.isPreMove2 && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1,
                bgcolor: `${semanticColors.status.warning}14`,
                border: `1px solid ${semanticColors.status.warning}40`,
              }}
            >
              <Typography variant="body2" color={semanticColors.status.warning}>
                This module uses bytecode version {result.metadata?.version}{" "}
                (pre-Move 2). Decompiled source may not faithfully represent the
                original code, and full verification via recompilation may
                produce different bytecode even for correct source.
              </Typography>
            </Box>
          )}

          {result.error && (
            <Typography variant="body2" color="error">
              {result.error}
            </Typography>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
