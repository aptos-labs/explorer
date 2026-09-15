import {Alert, Snackbar, Typography} from "@mui/material";
import type {Types} from "~/types/aptos";
import {Link} from "../../routing";
import {useTranslation} from "../../i18n";
import {CloseAction} from "./TransactionResponseSnackbar";

type FailureSnackbarProps = {
  onCloseSnackbar: () => void;
  data: Types.Transaction;
};

export default function FailureSnackbar({
  onCloseSnackbar,
  data,
}: FailureSnackbarProps) {
  const {t} = useTranslation();
  const {hash} = data;

  return (
    <Snackbar
      open={true}
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
    >
      <Alert
        variant="filled"
        severity="error"
        action={<CloseAction onCloseSnackbar={onCloseSnackbar} />}
      >
        <Typography variant="inherit">
          {t("snackbar.transaction")} {""}
          <Link to={`/txn/${hash}`} color="inherit" target="_blank">
            {hash}
          </Link>{" "}
          {t("snackbar.failed")}{" "}
          {"vm_status" in data && data.vm_status
            ? t("snackbar.failedWith", {status: data.vm_status})
            : t("snackbar.failedPeriod")}
        </Typography>
      </Alert>
    </Snackbar>
  );
}
