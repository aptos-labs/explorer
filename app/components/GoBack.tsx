import Button from "@mui/material/Button";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

function BackButton(handleClick: () => void) {
  return (
    <>
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
        Back
      </Button>
    </>
  );
}

export default function GoBack() {
  if (
    typeof window !== "undefined" &&
    window.history.state &&
    window.history.state.idx > 0
  ) {
    return BackButton(() => {
      window.history.back();
    });
  } else {
    return null;
  }
}
