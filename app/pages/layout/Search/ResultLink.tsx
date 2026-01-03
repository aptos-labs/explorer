import React, {memo} from "react";
import {Box, Typography} from "@mui/material";
import {Link} from "../../../routing";

type ResultLinkProps = {
  to: string | null;
  text: string;
  image?: string;
};

// Stable style object moved outside component to avoid recreation on every render
const resultLinkStyle = {
  padding: 0.5,
  display: "block",
  width: "100%",
  "&:hover": {
    backgroundColor: `"transparent"!important`,
    opacity: "0.8",
  },
} as const;

const imageContainerStyle = {mr: 1, display: "flex", alignItems: "center"};
const linkContentStyle = {display: "flex", justifyContent: "left"};

const ResultLink = memo(function ResultLink({
  to,
  text,
  image,
}: ResultLinkProps): React.JSX.Element {
  if (!to) {
    return (
      <Typography color="inherit" sx={resultLinkStyle}>
        {text}
      </Typography>
    );
  }

  return (
    <Link to={to} color="inherit" underline="none" sx={resultLinkStyle}>
      <Box sx={linkContentStyle}>
        {image ? (
          <Box component="span" sx={imageContainerStyle}>
            <img src={image} alt="" height={20} width={20} loading="lazy" />
          </Box>
        ) : null}
        <Typography variant="inherit">{text}</Typography>
      </Box>
    </Link>
  );
});

export default ResultLink;
