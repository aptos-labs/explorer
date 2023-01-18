import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  InputAdornment,
  OutlinedInput,
} from "@mui/material";
import React from "react";
import ContentBox from "../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../components/IndividualPageContent/ContentRow";

type UnstakingFlowProps = {
  handleDialogClose: () => void;
  isDialogOpen: boolean;
};

export default function Unstaking({
  handleDialogClose,
  isDialogOpen,
}: UnstakingFlowProps) {
  return (
    <Dialog open={isDialogOpen} onClose={handleDialogClose} fullWidth={true}>
      <DialogTitle>Unstake funds</DialogTitle>
      <DialogContent>
        <FormHelperText>Enter amount</FormHelperText>
        <OutlinedInput
          placeholder="0"
          endAdornment={<InputAdornment position="end">APT</InputAdornment>}
        />
      </DialogContent>
      <ContentBox>
        <ContentRow title="Transaction fee" value={null} />
      </ContentBox>
      <DialogActions>
        <Button onClick={handleDialogClose}>Unstake</Button>
      </DialogActions>
      <DialogContent>
        Your funds will be unlocked after the lock period in ? days.
      </DialogContent>
    </Dialog>
  );
}
