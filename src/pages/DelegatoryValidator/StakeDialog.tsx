import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  OutlinedInput,
  Stack,
  Typography,
} from "@mui/material";
import React, {useState} from "react";
import CloseIcon from "@mui/icons-material/Close";
import {Types} from "aptos";
import TimestampValue from "../../components/IndividualPageContent/ContentValue/TimestampValue";
import {grey} from "../../themes/colors/aptosColorPalette";

type StakeDialogProps = {
  handleDialogClose: () => void;
  isDialogOpen: boolean;
  accountResource?: Types.MoveResource | undefined;
};

export default function StakeDialog({
  handleDialogClose,
  isDialogOpen,
  accountResource,
}: StakeDialogProps) {
  const lockedUntilSecs = accountResource
    ? BigInt((accountResource.data as any).locked_until_secs)
    : null;
  const [stakedAmount, setStakedAmount] = useState<string>();
  const [stakedAmountError, setStakedAmountError] = useState<boolean>(false);
  const handleStakedAmountChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const amt = event.target.value;
    setStakedAmountError(isNaN(Number(amt)));
    setStakedAmount(amt);
  };

  return (
    <Dialog open={isDialogOpen} onClose={handleDialogClose}>
      <IconButton
        onClick={handleDialogClose}
        sx={{
          position: "absolute",
          right: 12,
          top: 12,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      <Stack sx={{marginX: 4, marginY: 4}}>
        <DialogTitle>
          <Typography variant="h5" textAlign="center">
            Stake Into The Pool
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack direction="column" spacing={2}>
            <FormHelperText sx={{fontSize: "1rem"}}>
              Enter amount
            </FormHelperText>
            <OutlinedInput
              onChange={handleStakedAmountChange}
              value={stakedAmount}
              fullWidth
              placeholder="0"
              endAdornment={<InputAdornment position="end">APT</InputAdornment>}
            />
            {stakedAmountError && <FormHelperText error>Error</FormHelperText>}
            <List dense>
              <ListItem>
                <ListItemText primary="Operator Commission" />
                <Typography>N/A</Typography>
              </ListItem>
              <ListItem>
                <ListItemText primary="Compound Rewards" />
                <Typography>N/A</Typography>
              </ListItem>
              <ListItem>
                <ListItemText primary="Next Unlock In" />
                <Typography>
                  {<TimestampValue timestamp={lockedUntilSecs?.toString()!} />}
                </Typography>
              </ListItem>
            </List>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDialogClose}
            variant="primary"
            fullWidth
            disabled={stakedAmountError || !stakedAmount}
            sx={{marginX: 2}}
          >
            Deposit
          </Button>
        </DialogActions>
        <DialogContent sx={{textAlign: "center"}}>
          <Typography variant="caption" color={grey[450]}>
            Be aware that you will be able to see your funds in the pool after 1
            epoch (~2 hours) due to the delay time
          </Typography>
        </DialogContent>
      </Stack>
    </Dialog>
  );
}
