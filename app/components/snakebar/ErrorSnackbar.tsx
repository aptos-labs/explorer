import {Alert, Snackbar} from "@mui/material";
import {CloseAction} from "./TransactionResponseSnackbar";
import {useTranslation} from "../../i18n";

type ErrorSnackbarProps = {
  errorMessage: string;
  onCloseSnackbar: () => void;
};

export default function ErrorSnackbar({
  errorMessage,
  onCloseSnackbar,
}: ErrorSnackbarProps) {
  const {t} = useTranslation();
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
        {t("snackbar.failedWithMessage", {message: errorMessage})}
      </Alert>
    </Snackbar>
  );
}
