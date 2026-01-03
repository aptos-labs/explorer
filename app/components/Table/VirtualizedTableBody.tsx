import React, {useRef, useMemo, useCallback} from "react";
import {useVirtualizer} from "@tanstack/react-virtual";
import {TableBody, TableBodyProps, SxProps, Theme} from "@mui/material";

interface VirtualizedTableBodyProps extends Omit<TableBodyProps, "children"> {
  children: React.ReactNode[];
  /**
   * Estimated height of each row in pixels.
   * Used for initial calculations. Actual height will be measured.
   */
  estimatedRowHeight?: number;
  /**
   * Maximum height of the table body container.
   * If not provided, will use a default of 600px.
   */
  maxHeight?: number;
  /**
   * Minimum number of rows before virtualization kicks in.
   * Defaults to 20.
   */
  virtualizationThreshold?: number;
  /**
   * Optional sx prop for styling
   */
  sx?: SxProps<Theme>;
  /**
   * Ref to the scrollable parent element.
   * If not provided, will look for a parent with overflow: auto/scroll.
   */
  scrollElementRef?: React.RefObject<HTMLElement>;
}

/**
 * VirtualizedTableBody - A virtualized table body component that only renders
 * visible rows, improving performance for large datasets.
 *
 * Note: This requires the parent Table to be wrapped in a scrollable container.
 * The table should have a fixed layout and the container should have maxHeight set.
 *
 * @example
 * ```tsx
 * <Box sx={{ maxHeight: '600px', overflow: 'auto' }}>
 *   <Table>
 *     <TableHead>...</TableHead>
 *     <VirtualizedTableBody estimatedRowHeight={60}>
 *       {items.map((item) => (
 *         <TableRow key={item.id}>
 *           <TableCell>{item.name}</TableCell>
 *         </TableRow>
 *       ))}
 *     </VirtualizedTableBody>
 *   </Table>
 * </Box>
 * ```
 */
export default function VirtualizedTableBody({
  children,
  estimatedRowHeight = 60,
  virtualizationThreshold = 20,
  scrollElementRef,
  sx,
  ...tableBodyProps
}: VirtualizedTableBodyProps) {
  const parentRef = useRef<HTMLTableSectionElement>(null);

  // Convert children to array if needed
  const rows = useMemo(() => {
    return React.Children.toArray(children);
  }, [children]);

  // Only virtualize if we have more than the threshold
  const shouldVirtualize = rows.length > virtualizationThreshold;

  // Find scrollable parent - memoized to satisfy react-hooks rules
  const getScrollElement = useCallback(() => {
    if (scrollElementRef?.current) {
      return scrollElementRef.current;
    }
    // Try to find scrollable parent
    let element = parentRef.current?.parentElement;
    while (element) {
      const style = window.getComputedStyle(element);
      if (
        style.overflow === "auto" ||
        style.overflow === "scroll" ||
        style.overflowY === "auto" ||
        style.overflowY === "scroll"
      ) {
        return element;
      }
      element = element.parentElement;
    }
    return null;
  }, [scrollElementRef]);

  // TanStack Virtual's API returns unmemoizable functions by design.
  // This is a known library limitation, not a code issue.
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement,
    estimateSize: () => estimatedRowHeight,
    overscan: 5, // Render 5 extra rows above and below visible area
  });

  if (!shouldVirtualize) {
    // For small lists, render normally without virtualization
    return (
      <TableBody
        ref={parentRef}
        sx={[
          {
            "&.MuiTableBody-root::before": {
              height: "0px",
            },
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...tableBodyProps}
      >
        {children}
      </TableBody>
    );
  }

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  return (
    <TableBody
      ref={parentRef}
      sx={[
        {
          "&.MuiTableBody-root::before": {
            height: "0px",
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...tableBodyProps}
    >
      {/* Top spacer */}
      {virtualItems.length > 0 && virtualItems[0] && (
        <tr aria-hidden="true" style={{height: `${virtualItems[0].start}px`}} />
      )}
      {/* Render only visible rows */}
      {virtualItems.map((virtualItem) => {
        const row = rows[virtualItem.index];
        // Clone the row element and add measurement attributes
        if (React.isValidElement(row)) {
          return React.cloneElement(
            row as React.ReactElement<Record<string, unknown>>,
            {
              key: virtualItem.key,
              "data-index": virtualItem.index,
              ref: virtualizer.measureElement,
            },
          );
        }
        return row;
      })}
      {/* Bottom spacer */}
      {virtualItems.length > 0 && virtualItems[virtualItems.length - 1] && (
        <tr
          aria-hidden="true"
          style={{
            height: `${
              totalSize - virtualItems[virtualItems.length - 1].end
            }px`,
          }}
        />
      )}
    </TableBody>
  );
}
