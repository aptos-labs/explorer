import {PropsWithChildren} from "react";
import {SxProps, TableRow, useTheme} from "@mui/material";
import {grey} from "../../themes/colors/aptosColorPalette";
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

  const sx: SxProps = {
    textDecoration: "none",
    cursor: clickDisabled ? undefined : "pointer",
    userSelect: "none",
    backgroundColor: `${theme.palette.mode === "dark" ? grey[800] : grey[50]}`,
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
  };

  const handleClick = () => {
    if (to) {
      navigate(augmentTo(to));
    }
    if (onClick) {
      onClick();
    }
  };

  const handleClickWithoutTo = onClick ? () => onClick() : undefined;

  return (
    <TableRow
      sx={sx}
      onClick={to ? handleClick : handleClickWithoutTo}
      role={to ? "link" : undefined}
      tabIndex={to ? 0 : undefined}
      onKeyDown={
        to
          ? (e: React.KeyboardEvent<HTMLTableRowElement>) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleClick();
              }
            }
          : undefined
      }
      {...props}
    />
  );
}
