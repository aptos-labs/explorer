import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import {useState} from "react";
import {useDecompilationConsent} from "../utils/useDecompilationConsent";

export default function DecompilationConsentGate() {
  const {grant} = useDecompilationConsent();
  const [dialogOpen, setDialogOpen] = useState(false);
  const theme = useTheme();

  return (
    <>
      <Box display="flex" justifyContent="center" alignItems="center" py={6}>
        <Button
          variant="contained"
          size="large"
          onClick={() => setDialogOpen(true)}
          sx={{textTransform: "none"}}
        >
          Decompile Source
        </Button>
      </Box>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontWeight: 700,
          }}
        >
          <WarningAmberRoundedIcon color="warning" />
          Decompilation Disclaimer
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Typography variant="body1">
              You are about to decompile on-chain bytecode. The resulting source
              code is a best-effort reconstruction and may not exactly match the
              original source.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              By proceeding you acknowledge that:
            </Typography>
            <Box
              component="ul"
              sx={{
                pl: 2.5,
                m: 0,
                "& li": {mb: 0.5},
              }}
            >
              <Typography component="li" variant="body2" color="text.secondary">
                Decompiled output is generated locally in your browser using
                WebAssembly — no data is sent to external servers.
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                The output may differ from the original source code and should
                not be treated as authoritative.
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                You accept full responsibility for how you use the decompiled
                output.
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{px: 3, pb: 2}}>
          <Button
            onClick={() => setDialogOpen(false)}
            color="inherit"
            sx={{
              textTransform: "none",
              color: theme.palette.text.secondary,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              grant();
              setDialogOpen(false);
            }}
            sx={{textTransform: "none"}}
          >
            I Understand — Decompile
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
