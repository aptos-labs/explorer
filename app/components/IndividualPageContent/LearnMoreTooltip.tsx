import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {Box, Link, Stack, Typography, useTheme} from "@mui/material";
import type React from "react";
import StyledTooltip from "../StyledTooltip";

function TooltipBox({children}: {children?: React.ReactNode}) {
  return <Box sx={{width: 25}}>{children}</Box>;
}

type LearnMoreTooltipProps = {
  text: string;
  link?: string;
  linkToText?: boolean;
};

export function LearnMoreTooltip({
  text,
  link,
  linkToText,
}: LearnMoreTooltipProps) {
  const theme = useTheme();
  const color = theme.palette.text.secondary;

  return (
    <TooltipBox>
      <StyledTooltip
        title={
          <Stack
            sx={{
              alignItems: "flex-end",
            }}
          >
            {linkToText ? (
              <Link
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
                sx={{
                  alignSelf: "flex-end",
                }}
              >
                {text}
              </Link>
            ) : (
              <>
                <Typography variant="inherit">{text}</Typography>
                {link && (
                  <Link
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="inherit"
                    sx={{
                      alignSelf: "flex-end",
                    }}
                  >
                    Learn More
                  </Link>
                )}
              </>
            )}
          </Stack>
        }
        arrow
      >
        <InfoOutlinedIcon fontSize="inherit" htmlColor={color} />
      </StyledTooltip>
    </TooltipBox>
  );
}

export function LearnMoreTooltipPlaceholder() {
  return <TooltipBox></TooltipBox>;
}
