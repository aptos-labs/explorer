import {Box, Typography} from "@mui/material";
import type React from "react";
import {memo} from "react";
import {Link} from "../../../routing";
import {SearchResultAvatar} from "./SearchResultAvatar";

type ResultLinkProps = {
  to: string | null;
  text: string;
  image?: string;
  identiconKey?: string;
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
  identiconKey,
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
        {(image || identiconKey) && (
          <Box component="span" sx={imageContainerStyle}>
            <SearchResultAvatar
              image={image}
              identiconKey={identiconKey}
              sizePx={20}
            />
          </Box>
        )}
        <Typography variant="inherit">{text}</Typography>
      </Box>
    </Link>
  );
});

export default ResultLink;
