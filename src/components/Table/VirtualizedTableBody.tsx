import React, {useRef, useMemo, useCallback} from "react";
import {useVirtualizer, useWindowVirtualizer} from "@tanstack/react-virtual";
import {TableBody, TableBodyProps, SxProps, Theme} from "@mui/material";

interface VirtualizedTableBodyProps extends Omit<TableBodyProps, "children"> {
  children: React.ReactNode[];
  /**
   * Estimated height of each row in pixels.
   * Used for initial calculations. Actual height will be measured.
   */
  estimatedRowHeight?: number;
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
   * Whether to use window scroll for virtualization.
   * Defaults to true for page-level scrolling.
   * Set to false to use a scrollable parent container instead.
   */
  useWindowScroll?: boolean;
  /**
   * Ref to the scrollable parent element.
   * Only used when useWindowScroll is false.
   * If not provided, will look for a parent with overflow: auto/scroll.
   */
  scrollElementRef?: React.RefObject<HTMLElement>;
}

// Shared props for internal virtualizer components
interface VirtualizerContentProps {
  rows: React.ReactNode[];
  estimatedRowHeight: number;
  sx?: SxProps<Theme>;
  tableBodyProps: Omit<TableBodyProps, "children">;
}

// Shared TableBody styling
const tableBodySx = {
  "&.MuiTableBody-root::before": {
    height: "0px",
  },
};

/**
 * Internal component for window-based virtualization.
 * Only instantiates useWindowVirtualizer.
 */
function WindowVirtualizedContent({
  rows,
  estimatedRowHeight,
  sx,
  tableBodyProps,
}: VirtualizerContentProps) {
  const parentRef = useRef<HTMLTableSectionElement>(null);

  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => estimatedRowHeight,
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  return (
    <TableBody
      ref={parentRef}
      sx={[tableBodySx, ...(Array.isArray(sx) ? sx : [sx])]}
      {...tableBodyProps}
    >
      {/* Top spacer */}
      {virtualItems.length > 0 && virtualItems[0] && (
        <tr aria-hidden="true" style={{height: `${virtualItems[0].start}px`}} />
      )}
      {/* Render only visible rows */}
      {virtualItems.map((virtualItem) => {
        const row = rows[virtualItem.index];
        if (React.isValidElement(row)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return React.cloneElement(row as React.ReactElement<any>, {
            key: virtualItem.key,
            "data-index": virtualItem.index,
            ref: virtualizer.measureElement,
          });
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

/**
 * Internal component for container-based virtualization.
 * Only instantiates useVirtualizer.
 */
function ContainerVirtualizedContent({
  rows,
  estimatedRowHeight,
  sx,
  tableBodyProps,
  scrollElementRef,
}: VirtualizerContentProps & {
  scrollElementRef?: React.RefObject<HTMLElement>;
}) {
  const parentRef = useRef<HTMLTableSectionElement>(null);

  // Find scrollable parent (for container-based scrolling)
  const findScrollableParent = useCallback(() => {
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
  }, [scrollElementRef, parentRef]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: findScrollableParent,
    estimateSize: () => estimatedRowHeight,
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  return (
    <TableBody
      ref={parentRef}
      sx={[tableBodySx, ...(Array.isArray(sx) ? sx : [sx])]}
      {...tableBodyProps}
    >
      {/* Top spacer */}
      {virtualItems.length > 0 && virtualItems[0] && (
        <tr aria-hidden="true" style={{height: `${virtualItems[0].start}px`}} />
      )}
      {/* Render only visible rows */}
      {virtualItems.map((virtualItem) => {
        const row = rows[virtualItem.index];
        if (React.isValidElement(row)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return React.cloneElement(row as React.ReactElement<any>, {
            key: virtualItem.key,
            "data-index": virtualItem.index,
            ref: virtualizer.measureElement,
          });
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

/**
 * VirtualizedTableBody - A virtualized table body component that only renders
 * visible rows, improving performance for large datasets.
 *
 * By default, uses window scroll for virtualization, allowing tables to
 * participate in page-level scrolling without internal scrollbars.
 *
 * @example
 * ```tsx
 * // Default: uses window scroll (no container needed)
 * <Table>
 *   <TableHead>...</TableHead>
 *   <VirtualizedTableBody estimatedRowHeight={60}>
 *     {items.map((item) => (
 *       <TableRow key={item.id}>
 *         <TableCell>{item.name}</TableCell>
 *       </TableRow>
 *     ))}
 *   </VirtualizedTableBody>
 * </Table>
 *
 * // With container scroll (legacy behavior)
 * <Box sx={{ maxHeight: '600px', overflow: 'auto' }}>
 *   <Table>
 *     <TableHead>...</TableHead>
 *     <VirtualizedTableBody useWindowScroll={false} estimatedRowHeight={60}>
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
  useWindowScroll = true,
  scrollElementRef,
  sx,
  ...tableBodyProps
}: VirtualizedTableBodyProps) {
  // Convert children to array if needed
  const rows = useMemo(() => {
    return React.Children.toArray(children);
  }, [children]);

  // Only virtualize if we have more than the threshold
  const shouldVirtualize = rows.length > virtualizationThreshold;

  // For small lists, render normally without virtualization
  if (!shouldVirtualize) {
    return (
      <TableBody
        sx={[tableBodySx, ...(Array.isArray(sx) ? sx : [sx])]}
        {...tableBodyProps}
      >
        {children}
      </TableBody>
    );
  }

  // Render the appropriate virtualized content based on scroll mode
  // Using conditional rendering ensures only one virtualizer hook is instantiated
  if (useWindowScroll) {
    return (
      <WindowVirtualizedContent
        rows={rows}
        estimatedRowHeight={estimatedRowHeight}
        sx={sx}
        tableBodyProps={tableBodyProps}
      />
    );
  }

  return (
    <ContainerVirtualizedContent
      rows={rows}
      estimatedRowHeight={estimatedRowHeight}
      sx={sx}
      tableBodyProps={tableBodyProps}
      scrollElementRef={scrollElementRef}
    />
  );
}
