import {PropsWithChildren, useMemo, useCallback} from "react";
import {SxProps, TableRow, useTheme} from "@mui/material";
import {useNavigate, useAugmentToWithGlobalSearchParams} from "../../routing";

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

  const sx = useMemo<SxProps>(
    () => ({
      textDecoration: "none",
      cursor: clickDisabled ? undefined : "pointer",
      userSelect: "none",
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
