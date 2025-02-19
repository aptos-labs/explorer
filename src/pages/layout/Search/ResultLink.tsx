import React from "react";
import {Box, Typography} from "@mui/material";
import {Link} from "../../../routing";

type ResultLinkProps = {
  to: string | null;
  text: string;
  image?: string;
};

export default function ResultLink({
  to,
  text,
  image,
}: ResultLinkProps): React.JSX.Element {
  const style = {
    padding: 0.5,
    display: "block",
    width: "100%",
    "&:hover": {
      backgroundColor: `"transparent"!important`,
      opacity: "0.8",
    },
  };

  if (!to) {
    return (
      <Typography color="inherit" sx={style}>
        {text}
      </Typography>
    );
  }

  return (
    <Link to={to} color="inherit" underline="none" sx={style}>
      <Box sx={{display: "flex", justifyContent: "left"}}>
        {image ? (
          <Box
            component="span"
            sx={{mr: 1, display: "flex", alignItems: "center"}}
          >
            <img src={image} alt={image} height={20} width={20} />
          </Box>
        ) : null}
        <Typography variant="inherit">{text}</Typography>
      </Box>
    </Link>
  );
}
