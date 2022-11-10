import {
  Box,
  Link,
  Stack,
  Tooltip,
  TooltipProps,
  Typography,
} from "@mui/material";
import React from "react";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {grey} from "../themes/colors/aptosColorPalette";

interface StyledTooltipProps extends TooltipProps {
  title: NonNullable<React.ReactNode>;
}

export default function StyledTooltip({
  children,
  title,
  ...props
}: StyledTooltipProps) {
  return (
    <Tooltip
      title={
        <Box sx={{fontSize: 13, fontFamily: "sans-serif", padding: 0.5}}>
          {title}
        </Box>
      }
      {...props}
    >
      {children}
    </Tooltip>
  );
}

type StyledLearnMoreTooltipProps = {
  text: string;
  link?: string;
  linkToText?: boolean;
};

// TODO: unify learn more tooltip component
export function StyledLearnMoreTooltip({
  text,
  link,
  linkToText,
}: StyledLearnMoreTooltipProps) {
  return (
    <StyledTooltip
      placement="bottom-start"
      title={
        <Stack alignItems="flex-end">
          {linkToText ? (
            <Link alignSelf="flex-end" href={link} color="inherit">
              {text}
            </Link>
          ) : (
            <>
              <Typography variant="inherit">{text}</Typography>
              {link && (
                <Link
                  alignSelf="flex-end"
                  href={link}
                  color="inherit"
                  target="_blank"
                >
                  Learn More
                </Link>
              )}
            </>
          )}
        </Stack>
      }
    >
      <InfoOutlinedIcon fontSize="inherit" htmlColor={grey[450]} />
    </StyledTooltip>
  );
}
