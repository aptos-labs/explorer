import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import Button from "@mui/material/Button";
import {useTranslation} from "../i18n";

function BackButton(handleClick: () => void, label: string) {
  return (
    <Button
      color="primary"
      variant="text"
      onClick={handleClick}
      sx={{
        mb: 2,
        p: 0,
        "&:hover": {
          background: "transparent",
        },
      }}
      startIcon={<ArrowBackRoundedIcon />}
    >
      {label}
    </Button>
  );
}

export default function GoBack() {
  const {t} = useTranslation();
  if (
    typeof window !== "undefined" &&
    window.history.state &&
    typeof window.history.state.idx === "number" &&
    window.history.state.idx > 0
  ) {
    return BackButton(() => {
      window.history.back();
    }, t("common.back"));
  } else {
    return null;
  }
}
