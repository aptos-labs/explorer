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

type StakeDialogProps = {
  handleDialogClose: () => void;
  isDialogOpen: boolean;
};

export default function StakeDialog({
  handleDialogClose,
  isDialogOpen,
}: StakeDialogProps) {
  return (
    <Dialog open={isDialogOpen} onClose={handleDialogClose} fullWidth={true}>
      <DialogTitle>Stake into the pool</DialogTitle>
      <DialogContent>
        <FormHelperText>Enter amount</FormHelperText>
        <OutlinedInput
          placeholder="0"
          endAdornment={<InputAdornment position="end">APT</InputAdornment>}
        />
      </DialogContent>
      <ContentBox>
        <ContentRow title="Operator commission" value={null} />
        <ContentRow title="Compound rewards" value={null} />
        <ContentRow title="Next unlock in" value={null} />
      </ContentBox>
      <ContentBox>
        <ContentRow title="Transaction fee" value={null} />
      </ContentBox>
      <DialogActions>
        <Button onClick={handleDialogClose}>Deposit</Button>
      </DialogActions>
      <DialogContent>
        Be aware that you will be able to see your funds in the pool after 1
        epoch (~2 hours) due to the delay time
      </DialogContent>
    </Dialog>
  );
}
