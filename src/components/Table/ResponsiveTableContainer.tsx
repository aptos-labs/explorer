import React, {PropsWithChildren} from "react";
import {Box, BoxProps, SxProps, Theme} from "@mui/material";

interface ResponsiveTableContainerProps extends Omit<BoxProps, "sx"> {
  /**
   * Maximum height of the container. Defaults to 800px.
   * This is needed for virtualization to work properly.
   */
  maxHeight?: number | string;
  /**
   * Optional sx prop for additional styling
   */
  sx?: SxProps<Theme>;
}

/**
 * ResponsiveTableContainer - A container component for tables that:
 * - Hides scrollbars visually while maintaining scroll functionality (needed for VirtualizedTableBody)
 * - Sets width to 100% to fit container
 * - Maintains maxHeight for virtualization
 *
 * @example
 * ```tsx
 * <ResponsiveTableContainer>
 *   <Table>
 *     <TableHead>...</TableHead>
 *     <VirtualizedTableBody>...</VirtualizedTableBody>
 *   </Table>
 * </ResponsiveTableContainer>
 * ```
 */
export default function ResponsiveTableContainer({
  children,
  maxHeight = "800px",
  sx,
  ...props
}: PropsWithChildren<ResponsiveTableContainerProps>) {
  return (
    <Box
      sx={[
        {
          width: "100%",
          maxHeight,
          overflow: "auto",
          // Hide scrollbars while maintaining scroll functionality
          scrollbarWidth: "none", // Firefox
          "&::-webkit-scrollbar": {
            display: "none", // Chrome/Safari/Edge
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    >
      {children}
    </Box>
  );
}
