import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Stack,
  Typography,
} from "@mui/material";
import React, {useState} from "react";
import CloseIcon from "@mui/icons-material/Close";
import {grey} from "../../themes/colors/aptosColorPalette";
import {Types} from "aptos";
import {parseTimestamp, timestampDisplay} from "../utils";

type isDialogOpen = {
  handleDialogClose: () => void;
  isDialogOpen: boolean;
  accountResource?: Types.MoveResource | undefined;
};

export default function UnstakeDialog({
  handleDialogClose,
  isDialogOpen,
  accountResource,
}: isDialogOpen) {
  const lockedUntilSecs = accountResource
    ? BigInt((accountResource.data as any).locked_until_secs)
    : null;
  const moment = parseTimestamp(Number(lockedUntilSecs).toString());
  const timestamp_display = timestampDisplay(moment);

  const [unstakedAmount, setUnstakedAmount] = useState<string>();
  const [unstakedAmountError, setUnstakedAmountError] =
    useState<boolean>(false);
  const handleUnstakedAmountChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const amt = event.target.value;
    setUnstakedAmountError(isNaN(Number(amt)));
    setUnstakedAmount(amt);
  };

  return (
    <Dialog open={isDialogOpen} onClose={handleDialogClose} fullWidth={true}>
      <IconButton
        onClick={handleDialogClose}
        sx={{
          position: "absolute",
          right: 12,
          top: 12,
          color: grey[450],
        }}
      >
        <CloseIcon />
      </IconButton>
      <Stack sx={{marginX: 4, marginY: 4}}>
        <DialogTitle>
          <Typography variant="h5" textAlign="center">
            Unstake funds
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack direction="column" spacing={2}>
            <FormHelperText sx={{fontSize: "1rem"}}>
              Enter amount
            </FormHelperText>
            <OutlinedInput
              onChange={handleUnstakedAmountChange}
              value={unstakedAmount}
              fullWidth
              placeholder="0"
              endAdornment={<InputAdornment position="end">APT</InputAdornment>}
            />
            {unstakedAmountError && (
              <FormHelperText error>Error</FormHelperText>
            )}
            <Stack direction="row" spacing={1}>
              <Button variant="outlined">10%</Button>
              <Button variant="outlined">25%</Button>
              <Button variant="outlined">50%</Button>
              <Button variant="outlined">MAX</Button>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDialogClose}
            variant="primary"
            fullWidth
            disabled={unstakedAmountError || !unstakedAmount}
            sx={{marginX: 2}}
          >
            Unstake
          </Button>
        </DialogActions>
        <DialogContent sx={{textAlign: "center"}}>
          <Typography variant="caption" color={grey[450]}>
            Your funds will be unlocked after the lock period in{" "}
            {timestamp_display.local_formatted_day} days.
          </Typography>
        </DialogContent>
      </Stack>
    </Dialog>
  );
}
