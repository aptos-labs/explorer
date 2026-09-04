import {type SxProps, TableRow, useTheme} from "@mui/material";
import {type PropsWithChildren, useCallback, useMemo} from "react";
import {useAugmentToWithGlobalSearchParams, useNavigate} from "../../routing";

export default function GeneralTableRow({
  to,
  onClick,
  ...props
}: PropsWithChildren<{
  to?: string;
  onClick?: () => void;
}>) {
  const theme = useTheme();
  const navigate = useNavigate();
  const augmentTo = useAugmentToWithGlobalSearchParams();
  const clickDisabled = !to;
  // Suppressing selection keeps drag gestures from highlighting text on rows
  // that react to a click. Read-only rows must stay selectable so users can
  // copy values out of key/value tables.
  const isInteractive = Boolean(to || onClick);

  const sx = useMemo<SxProps>(
    () => ({
      textDecoration: "none",
      cursor: clickDisabled ? undefined : "pointer",
      userSelect: isInteractive ? "none" : undefined,
      backgroundColor: theme.palette.background.paper,
      "&:hover:not(:active)": clickDisabled
        ? undefined
        : {
            filter: `${
              theme.palette.mode === "dark"
                ? "brightness(0.9)"
                : "brightness(0.99)"
            }`,
          },
      "&:active": clickDisabled
        ? undefined
        : {
            background: theme.palette.neutralShade.main,
            transform: "translate(0,0.1rem)",
          },
    }),
    [
      clickDisabled,
      isInteractive,
      theme.palette.background.paper,
      theme.palette.mode,
      theme.palette.neutralShade.main,
    ],
  );

  const handleClick = useCallback(() => {
    if (to) {
      navigate({to: augmentTo(to)});
    }
    if (onClick) {
      onClick();
    }
  }, [to, navigate, augmentTo, onClick]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTableRowElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick],
  );

  return (
    <TableRow
      sx={sx}
      onClick={to ? handleClick : onClick}
      role={to ? "link" : undefined}
      tabIndex={to ? 0 : undefined}
      onKeyDown={to ? handleKeyDown : undefined}
      {...props}
    />
  );
}
