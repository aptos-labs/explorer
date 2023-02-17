import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import React, {useState} from "react";
import StyledDialog from "../../components/StyledDialog";
import {useNavigate} from "react-router-dom";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {grey} from "../../themes/colors/aptosColorPalette";
import {StakeOperation} from "../../api/hooks/useSubmitStakeOperation";

type TransactionSucceededDialogProps = {
  handleDialogClose: () => void;
  isDialogOpen: boolean;
  amount: string; // could be staked, unlocked, reactivated or withdrawn amonut
  transactionHash: string;
  stakeOperation: StakeOperation;
};

export default function TransactionSucceededDialog({
  handleDialogClose,
  isDialogOpen,
  amount,
  transactionHash,
  stakeOperation,
}: TransactionSucceededDialogProps) {
  const navigate = useNavigate();
  const theme = useTheme();

  const [copyTooltipOpen, setCopyTooltipOpen] = useState<boolean>(false);

  const copyAddress = async (_: React.MouseEvent<HTMLButtonElement>) => {
    await navigator.clipboard.writeText(transactionHash);
    setCopyTooltipOpen(true);
    setTimeout(() => {
      setCopyTooltipOpen(false);
    }, 2000);
  };

  function getDialogSubtext() {
    switch (stakeOperation) {
      case StakeOperation.UNLOCK:
        return (
          <Box>
            <Typography variant="body2" sx={{fontSize: 12}}>
              {`You’ve successfully unlocked ${amount} APT`}
            </Typography>
          </Box>
        );
      case StakeOperation.WITHDRAW:
        return (
          <Box>
            <Typography variant="body2" sx={{fontSize: 12}}>
              {`You’ve successfully withdrawn ${amount} APT`}
            </Typography>
          </Box>
        );
      case StakeOperation.REACTIVATE:
      case StakeOperation.STAKE:
        return (
          <Box>
            <Typography variant="body2" sx={{fontSize: 12}}>
              Transaction is in progress.
            </Typography>
            <Typography variant="body2" sx={{fontSize: 12}}>
              {`Soon you will see your deposit of ${amount} APT in the staking pool.`}
            </Typography>
          </Box>
        );
    }
  }

  return (
    <StyledDialog handleDialogClose={handleDialogClose} open={isDialogOpen}>
      <DialogTitle variant="h5" textAlign="center">
        <Stack spacing={2}>
          <div>Congratulations!</div>
          {getDialogSubtext()}
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack
          direction="row"
          sx={{
            backgroundColor: `${
              theme.palette.mode === "dark" ? grey[600] : grey[50]
            }`,
            paddingLeft: "inherit",
            marginX: 1,
            borderRadius: 1,
          }}
        >
          <Grid item xs zeroMinWidth>
            <Typography variant="caption">Transaction Address</Typography>
            <Typography variant="body2" style={{overflowWrap: "break-word"}}>
              {transactionHash}
            </Typography>
          </Grid>
          <Tooltip title="Copied" open={copyTooltipOpen}>
            <Button
              sx={{
                color: "inherit",
                "&:hover": {
                  backgroundColor: `${
                    theme.palette.mode === "dark" ? grey[500] : grey[300]
                  }`,
                },
              }}
              onClick={copyAddress}
              endIcon={<ContentCopyIcon sx={{opacity: "0.75", mr: 1}} />}
            />
          </Tooltip>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => navigate(`/txn/${transactionHash}`)}
          variant="primary"
          fullWidth
          sx={{marginX: 3}}
        >
          View Transaction
        </Button>
      </DialogActions>
    </StyledDialog>
  );
}
