import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {useNetworkSelector} from "../global-config";
import {useLocalnetDetection} from "../hooks/useLocalnetDetection";
import {defaultNetworkName} from "../constants";

export default function LocalnetUnavailableModal() {
  const [networkName, setNetworkName] = useNetworkSelector();
  const {isAvailable, isChecked} = useLocalnetDetection();

  // Show modal when on localnet, initial check is done, and it's not running
  const showModal = networkName === "localnet" && isChecked && !isAvailable;

  const handleSwitchToMainnet = () => {
    setNetworkName(defaultNetworkName);
    // Update URL as well
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("network", defaultNetworkName);
      window.history.replaceState({}, "", url.toString());
    }
  };

  if (!showModal) return null;

  return (
    <Dialog
      open={showModal}
      maxWidth="sm"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(4px)",
          },
        },
      }}
    >
      <DialogTitle sx={{display: "flex", alignItems: "center", gap: 1}}>
        <WarningAmberIcon color="warning" />
        Localnet Not Running
      </DialogTitle>
      <DialogContent>
        <Box sx={{mb: 2}}>
          <Typography variant="body1" gutterBottom>
            Unable to connect to a local Aptos node at{" "}
            <code>http://127.0.0.1:8080</code>.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{mt: 2}}>
            To use localnet, start a local Aptos node with:
          </Typography>
          <Box
            component="pre"
            sx={{
              mt: 1,
              p: 2,
              bgcolor: "action.hover",
              borderRadius: 1,
              overflow: "auto",
              fontSize: "0.875rem",
            }}
          >
            aptos node run-local-testnet --with-indexer-api
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{mt: 2}}>
            Or switch to a different network below.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{px: 3, pb: 2}}>
        <Button onClick={handleSwitchToMainnet} variant="contained">
          Switch to Mainnet
        </Button>
      </DialogActions>
    </Dialog>
  );
}
