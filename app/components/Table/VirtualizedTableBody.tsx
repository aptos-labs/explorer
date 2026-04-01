import {
  type SxProps,
  TableBody,
  type TableBodyProps,
  type Theme,
} from "@mui/material";
import {useVirtualizer} from "@tanstack/react-virtual";
import React, {useCallback, useMemo, useRef} from "react";

/** Ensures list children have keys when `renderRow` omits them (non-virtualized path). */
function ensureRowElementKey(
  row: React.ReactElement,
  index: number,
): React.ReactElement {
  if (row.key != null) {
    return row;
  }
  return React.cloneElement(row, {key: index});
}

type VirtualizedTableBodyBaseProps = Omit<TableBodyProps, "children"> & {
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
  scrollElementRef?: React.RefObject<HTMLElement | null>;
};

export type VirtualizedTableBodyProps = VirtualizedTableBodyBaseProps &
  (
    | {
        children: React.ReactNode;
        rowCount?: never;
        renderRow?: never;
      }
    | {
        /**
         * Row count when using `renderRow` instead of pre-built `children`.
         * Avoids creating thousands of React elements when filters change (e.g. coins list).
         */
        rowCount: number;
        renderRow: (index: number) => React.ReactElement;
        children?: never;
      }
  );

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
export default function VirtualizedTableBody(props: VirtualizedTableBodyProps) {
  const {
    estimatedRowHeight = 60,
    virtualizationThreshold = 20,
    scrollElementRef,
    sx,
    children,
    rowCount: rowCountProp,
    renderRow: renderRowProp,
    ...tableBodySpread
  } = props as VirtualizedTableBodyBaseProps & {
    children?: React.ReactNode;
    rowCount?: number;
    renderRow?: (index: number) => React.ReactElement;
  };

  const isRenderMode = typeof renderRowProp === "function";
  if (isRenderMode && !Number.isFinite(rowCountProp)) {
    console.error(
      "[VirtualizedTableBody] `renderRow` requires a finite numeric `rowCount`; got " +
        `${String(rowCountProp)}. No rows will render.`,
    );
  }
  const rowCount =
    isRenderMode && Number.isFinite(rowCountProp)
      ? (rowCountProp as number)
      : 0;
  const renderRow = isRenderMode ? renderRowProp : null;

  const parentRef = useRef<HTMLTableSectionElement>(null);

  // Convert children to array if needed (pre-built row elements)
  const rows = useMemo(() => {
    if (isRenderMode || children == null) {
      return [] as React.ReactNode[];
    }
    return React.Children.toArray(children);
  }, [children, isRenderMode]);

  const count = isRenderMode ? rowCount : rows.length;

  // Only virtualize if we have more than the threshold
  const shouldVirtualize = count > virtualizationThreshold;

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

  const virtualizer = useVirtualizer({
    count,
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
        {...tableBodySpread}
      >
        {isRenderMode && renderRow
          ? Array.from({length: rowCount}, (_, i) => {
              const row = renderRow(i);
              if (React.isValidElement(row)) {
                return ensureRowElementKey(row, i);
              }
              // biome-ignore lint/suspicious/noArrayIndexKey: fallback when renderRow returns non-element; index is the only stable id
              return <React.Fragment key={i}>{row}</React.Fragment>;
            })
          : children}
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
      {...tableBodySpread}
    >
      {/* Top spacer */}
      {virtualItems.length > 0 && virtualItems[0] && (
        // biome-ignore lint/a11y/noAriaHiddenOnFocusable: presentational spacer row, not interactive
        <tr aria-hidden="true" style={{height: `${virtualItems[0].start}px`}} />
      )}
      {/* Render only visible rows */}
      {virtualItems.map((virtualItem) => {
        if (isRenderMode && renderRow) {
          const row = renderRow(virtualItem.index);
          return React.cloneElement(
            row as React.ReactElement<Record<string, unknown>>,
            {
              key: virtualItem.key,
              "data-index": virtualItem.index,
              ref: virtualizer.measureElement,
            },
          );
        }
        const row = rows[virtualItem.index];
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
        // biome-ignore lint/a11y/noAriaHiddenOnFocusable: presentational spacer row, not interactive
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
