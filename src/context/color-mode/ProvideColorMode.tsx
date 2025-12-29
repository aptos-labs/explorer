import {ThemeProvider} from "@mui/system";
import React, {createContext, useContext, useMemo} from "react";
import useProvideColorMode, {ColorModeContext} from "./ProvideColorMode.State";

interface ProvideColorModeProps {
  children: React.ReactNode;
}

const colorModeContext = createContext<ColorModeContext | null>(null);
const themeContext = createContext<
  ReturnType<typeof useProvideColorMode>["theme"] | null
>(null);

export const ProvideColorMode: React.FC<ProvideColorModeProps> = ({
  children,
}: ProvideColorModeProps) => {
  const {toggleColorMode, theme} = useProvideColorMode();

  // Memoize the context value to prevent unnecessary re-renders
  const colorModeValue = useMemo(() => ({toggleColorMode}), [toggleColorMode]);

  return (
    <colorModeContext.Provider value={colorModeValue}>
      <themeContext.Provider value={theme}>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </themeContext.Provider>
    </colorModeContext.Provider>
  );
};

export const useColorMode = (): ColorModeContext => {
  const context = useContext(colorModeContext);
  if (!context) {
    throw new Error("useColorMode must be used within a ColorModeContext");
  }
  return context;
};

/**
 * Hook to get only the theme
 * Component will only re-render when theme changes
 */
export const useThemeFromContext = () => {
  const context = useContext(themeContext);
  if (!context) {
    throw new Error("useThemeFromContext must be used within a ThemeContext");
  }
  return context;
};
