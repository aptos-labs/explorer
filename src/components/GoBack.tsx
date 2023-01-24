import * as React from "react";
import {useNavigate} from "react-router-dom";
import Button from "@mui/material/Button";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import {useNavigateWithParams} from "../api/hooks/useNavigateWithParams";

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

type GoBackProps = {
  to?: string;
};

export default function GoBack({to}: GoBackProps): JSX.Element | null {
  const navigate = useNavigate();
  const navigateWithParams = useNavigateWithParams();

  if (window.history.state && window.history.state.idx > 0) {
    return BackButton(() => {
      navigate(-1);
    });
  } else {
    if (to != null) {
      return BackButton(() => {
        navigateWithParams(to);
      });
    } else {
      return null;
    }
  }
}
