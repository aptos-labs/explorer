import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  Box,
  Link,
  Stack,
  Tooltip,
  type TooltipProps,
  Typography,
  useTheme,
} from "@mui/material";
import type React from "react";

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
  const theme = useTheme();
  return (
    <StyledTooltip
      placement="bottom-start"
      title={
        <Stack sx={{alignItems: "flex-end"}}>
          {linkToText ? (
            <Link
              sx={{alignSelf: "flex-end"}}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              color="inherit"
            >
              {text}
            </Link>
          ) : (
            <>
              <Typography variant="inherit">{text}</Typography>
              {link && (
                <Link
                  sx={{alignSelf: "flex-end"}}
                  href={link}
                  color="inherit"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn More
                </Link>
              )}
            </>
          )}
        </Stack>
      }
    >
      <InfoOutlinedIcon
        htmlColor={theme.palette.text.secondary}
        sx={{fontSize: 15}}
      />
    </StyledTooltip>
  );
}
