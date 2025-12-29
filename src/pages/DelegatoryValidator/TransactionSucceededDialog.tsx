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
import {useState} from "react";
import StyledDialog from "../../components/StyledDialog";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {StakeOperation} from "../../api/hooks/delegations";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {useLogEventWithBasic} from "../Account/hooks/useLogEventWithBasic";
import {addressFromWallet} from "../../utils";

type TransactionSucceededDialogProps = {
  handleDialogClose: () => void;
  isDialogOpen: boolean;
  amount: string; // could be staked, unlocked, reactivated or withdrawn amount
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
  const theme = useTheme();
  const {account, wallet} = useWallet();
  const [copyTooltipOpen, setCopyTooltipOpen] = useState<boolean>(false);
  const logEvent = useLogEventWithBasic();

  const copyAddress = async () => {
    await navigator.clipboard.writeText(transactionHash);
    setCopyTooltipOpen(true);
    setTimeout(() => {
      setCopyTooltipOpen(false);
    }, 2000);
  };
  const onViewTransactionClick = () => {
    logEvent("view_transaction_button_clicked", stakeOperation, {
      transactionHash: transactionHash,
      amount: amount,
      wallet_address: addressFromWallet(account?.address),
      wallet_name: wallet?.name ?? "",
    });
  };

  function getDialogSubtext() {
    switch (stakeOperation) {
      case StakeOperation.UNLOCK:
        return (
          <Box>
            <Typography variant="body2" sx={{fontSize: 12}}>
              {"You've successfully unlocked "}
              <span style={{fontWeight: 600}}>{amount}</span>
              {" APT"}
            </Typography>
          </Box>
        );
      case StakeOperation.WITHDRAW:
        return (
          <Box>
            <Typography variant="body2" sx={{fontSize: 12}}>
              {"You've successfully withdrawn "}
              <span style={{fontWeight: 600}}>{amount}</span>
              {" APT"}
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
              {"Soon you will see your deposit of "}
              <span style={{fontWeight: 600}}>{amount}</span>
              {" APT in the staking pool."}
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
            backgroundColor: `${theme.palette.background.paper}`,
            paddingLeft: "inherit",
            marginX: 1,
            borderRadius: 1,
            paddingY: 2,
          }}
        >
          <Grid size="grow">
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
                    theme.palette.mode === "dark"
                      ? theme.palette.neutralShade.lighter
                      : theme.palette.neutralShade.darker
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
          href={`/txn/${transactionHash}`}
          onClick={onViewTransactionClick}
          target="_blank"
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
