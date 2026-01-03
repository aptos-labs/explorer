import {Box, useTheme, alpha, CircularProgress} from "@mui/material";
import React, {lazy, Suspense} from "react";
import {getSemanticColors} from "../../themes/colors/aptosBrandColors";
import EmptyValue from "./ContentValue/EmptyValue";

// Dynamically import @uiw/react-json-view only on client side (React 19 compatible)
const JsonView = lazy(() => import("@uiw/react-json-view"));

const MAX_CARD_HEIGHT = 500;

type JsonViewCardProps = {
  data: unknown;
  collapsedByDefault?: boolean;
};

export default function JsonViewCard({
  data,
  collapsedByDefault,
}: JsonViewCardProps) {
  const theme = useTheme();
  const semanticColors = getSemanticColors(theme.palette.mode);
  const textColor = theme.palette.primary.main;
  const secondaryTextColor = alpha(theme.palette.primary.main, 0.3);

  if (!data) {
    return <EmptyValue />;
  }

  return (
    <Box
      sx={{
        backgroundColor: semanticColors.codeBlock.background,
        overflow: "auto",
        maxHeight: MAX_CARD_HEIGHT,
      }}
      padding={2}
      borderRadius={1}
    >
      <Suspense fallback={<CircularProgress size={24} />}>
        <JsonView
          value={data as object}
          collapsed={collapsedByDefault ? 1 : false}
          displayDataTypes={false}
          displayObjectSize={false}
          enableClipboard={true}
          style={
            {
              fontFamily: theme.typography.fontFamily,
              fontSize: theme.typography.fontSize,
              backgroundColor: "transparent",
              // Custom colors using CSS variables
              "--w-rjv-key-string": textColor,
              "--w-rjv-type-string-color": textColor,
              "--w-rjv-type-int-color": textColor,
              "--w-rjv-type-float-color": textColor,
              "--w-rjv-type-boolean-color": textColor,
              "--w-rjv-type-null-color": secondaryTextColor,
              "--w-rjv-arrow-color": secondaryTextColor,
              "--w-rjv-brackets-color": secondaryTextColor,
              "--w-rjv-colon-color": secondaryTextColor,
              "--w-rjv-ellipsis-color": secondaryTextColor,
              "--w-rjv-info-color": secondaryTextColor,
            } as React.CSSProperties
          }
        />
      </Suspense>
    </Box>
  );
}
