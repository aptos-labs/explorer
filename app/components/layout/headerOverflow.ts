/** Extra pixels of slack before expanding out of compact chrome. */
export const HEADER_OVERFLOW_HYSTERESIS_PX = 16;

/**
 * Approximate width of help + settings + language + theme + wallet when those
 * controls have not been measured yet (first overflow-compact frame).
 */
export const FALLBACK_DESKTOP_ACTIONS_WIDTH_PX = 320;

export function readColumnGap(element: Element): number {
  if (typeof getComputedStyle === "undefined") {
    return 0;
  }
  const gap = Number.parseFloat(getComputedStyle(element).columnGap);
  return Number.isFinite(gap) ? gap : 0;
}

export function sumFlexItemWidths(widths: number[], gap: number): number {
  const present = widths.filter((width) => width > 0);
  if (present.length === 0) {
    return 0;
  }
  return (
    present.reduce((sum, width) => sum + width, 0) + gap * (present.length - 1)
  );
}

/**
 * Whether the header should use compact (hamburger) chrome because the
 * desktop toolbar's intrinsic width does not fit `availableWidth`.
 *
 * Stay compact until there is `hysteresisPx` of slack so label-length
 * changes cannot flicker between layouts at the boundary.
 */
export function desktopToolbarNeedsCompact({
  availableWidth,
  intrinsicWidth,
  currentlyCompact,
  hysteresisPx = HEADER_OVERFLOW_HYSTERESIS_PX,
}: {
  availableWidth: number;
  intrinsicWidth: number;
  currentlyCompact: boolean;
  hysteresisPx?: number;
}): boolean {
  if (availableWidth <= 0 || intrinsicWidth <= 0) {
    return currentlyCompact;
  }
  if (currentlyCompact) {
    return intrinsicWidth + hysteresisPx > availableWidth;
  }
  return intrinsicWidth > availableWidth;
}
