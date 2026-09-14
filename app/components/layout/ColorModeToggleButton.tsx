import IconButton from "@mui/material/IconButton";
import {useTheme} from "@mui/material/styles";
import IconDark from "../../assets/svg/icon_dark.svg?react";
import IconLight from "../../assets/svg/icon_light.svg?react";
import {useColorMode} from "../../context/color-mode";

export default function ColorModeToggleButton() {
  const theme = useTheme();
  const {toggleColorMode} = useColorMode();
  const isDark = theme.palette.mode === "dark";

  return (
    <IconButton
      onClick={toggleColorMode}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      sx={{
        marginLeft: "1rem",
        color: "inherit",
      }}
    >
      {isDark ? (
        <IconDark width={20} height={20} />
      ) : (
        <IconLight width={20} height={20} />
      )}
    </IconButton>
  );
}
