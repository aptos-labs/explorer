import Button from "@mui/material/Button";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import {useNavigate} from "../routing";

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
  const navigate = useNavigate();
  console.log(window.history.state);
  console.log(window.history.state.idx);
  if (window.history.state && window.history.state.idx > 0) {
    return BackButton(() => {
      navigate(-1);
    });
  } else {
    return BackButton(() => {
      navigate("/");
    });
  }
}
