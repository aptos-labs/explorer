/** Default number of block heights on `/blocks` (FEAT-BLOCKS-001). */
export const DEFAULT_BLOCK_PAGE_SIZE = 20;

/**
 * Largest inclusive range `/blocks` will fetch. Each height is its own REST
 * call, so an unbounded `start`/`end` pair would fan out into rate limits.
 */
export const MAX_BLOCK_PAGE_SIZE = 100;

export type BlockHeightRange = {
  /** Inclusive older height. */
  start: number;
  /** Inclusive newer height. */
  end: number;
};

/**
 * How `/blocks` chooses which heights to show.
 *
 * - `live` follows the chain tip. Page numbers are a poor fit because that tip
 *   moves continuously.
 * - `range` is a frozen inclusive window (`?start=` oldest, `?end=` newest).
 * - `cursor` is the legacy `?start={newest}` form: a default-sized window
 *   ending at that height, with no `end` param.
 */
export type BlockListQuery =
  | {kind: "live"; pageSize: number}
  | {kind: "range"; range: BlockHeightRange; pageSize: number}
  | {kind: "cursor"; newest: number; pageSize: number};

const NON_NEGATIVE_INTEGER = /^(?:0|[1-9]\d*)$/;

export function parseHeightParam(
  value: string | null | undefined,
): number | undefined {
  if (value == null) return undefined;
  const trimmed = value.trim();
  if (!NON_NEGATIVE_INTEGER.test(trimmed)) return undefined;
  const height = Number(trimmed);
  if (!Number.isSafeInteger(height)) return undefined;
  return height;
}

function clampPageSize(size: number, maxSize: number): number {
  return Math.min(Math.max(size, 1), maxSize);
}

function orderedRange(
  older: number,
  newer: number,
  maxSize: number,
): {range: BlockHeightRange; pageSize: number} {
  let start = Math.min(older, newer);
  const end = Math.max(older, newer);
  const span = end - start + 1;
  const pageSize = clampPageSize(span, maxSize);
  if (span > pageSize) {
    start = end - pageSize + 1;
  }
  return {range: {start, end}, pageSize};
}

/**
 * Read the blocks-list window from query params.
 *
 * Both `start` and `end` select an inclusive height range. `start` alone keeps
 * the legacy cursor (newest height of the default window). Missing or invalid
 * params follow the live tip.
 */
export function parseBlockListQuery(
  params: {start?: string | null; end?: string | null},
  options?: {defaultSize?: number; maxSize?: number},
): BlockListQuery {
  const defaultSize = options?.defaultSize ?? DEFAULT_BLOCK_PAGE_SIZE;
  const maxSize = options?.maxSize ?? MAX_BLOCK_PAGE_SIZE;
  const start = parseHeightParam(params.start);
  const end = parseHeightParam(params.end);

  if (start !== undefined && end !== undefined) {
    const ordered = orderedRange(start, end, maxSize);
    return {kind: "range", ...ordered};
  }

  const newest = end ?? start;
  if (newest !== undefined) {
    return {kind: "cursor", newest, pageSize: defaultSize};
  }

  return {kind: "live", pageSize: defaultSize};
}

export function rangeEndingAt(
  newest: number,
  pageSize: number,
): BlockHeightRange {
  return {
    start: Math.max(0, newest - pageSize + 1),
    end: newest,
  };
}

/** Heights to render for this query. Live mode waits until the ledger height is known. */
export function windowForQuery(
  query: BlockListQuery,
  ledgerHeight: number | undefined,
): BlockHeightRange | undefined {
  if (query.kind === "range") return query.range;
  if (query.kind === "cursor")
    return rangeEndingAt(query.newest, query.pageSize);
  if (ledgerHeight === undefined || ledgerHeight < 0) return undefined;
  return rangeEndingAt(ledgerHeight, query.pageSize);
}

export type BlockRangeShift = "older" | "newer";

/**
 * How far Previous/Next move.
 *
 * The step is the inclusive length of the window on screen, so a range chosen
 * in the URL keeps that length. A window that begins at height 0 and is shorter
 * than the default page (the remainder after tip-aligned pages) steps forward
 * by the default page so the next window lines up with those pages again.
 */
export function blockRangeStep(displayed: BlockHeightRange): number {
  const span = displayed.end - displayed.start + 1;
  if (displayed.start === 0 && span < DEFAULT_BLOCK_PAGE_SIZE) {
    return DEFAULT_BLOCK_PAGE_SIZE;
  }
  return span;
}

/**
 * Next or previous window.
 *
 * Older always freezes an explicit range. Newer returns to the live tip when
 * the following window would reach the current ledger height, so the latest
 * page is not pinned to a height that is already stale.
 * Returns undefined when that direction has nowhere to go.
 */
export function shiftBlockListQuery(
  displayed: BlockHeightRange,
  direction: BlockRangeShift,
  ledgerHeight: number | undefined,
): BlockListQuery | undefined {
  const step = blockRangeStep(displayed);

  if (direction === "older") {
    if (displayed.start <= 0) return undefined;
    const end = displayed.start - 1;
    const start = Math.max(0, end - step + 1);
    return {
      kind: "range",
      range: {start, end},
      pageSize: end - start + 1,
    };
  }

  if (ledgerHeight !== undefined && displayed.end >= ledgerHeight) {
    return undefined;
  }

  const start = displayed.end + 1;
  const end = start + step - 1;
  if (ledgerHeight !== undefined && end >= ledgerHeight) {
    return {kind: "live", pageSize: DEFAULT_BLOCK_PAGE_SIZE};
  }
  return {
    kind: "range",
    range: {start, end},
    pageSize: end - start + 1,
  };
}

/** Query params for a window. Live mode clears the range so the tip can move. */
export function blockListSearchParams(query: BlockListQuery): {
  start?: string;
  end?: string;
} {
  if (query.kind !== "range") {
    return {};
  }
  return {
    start: String(query.range.start),
    end: String(query.range.end),
  };
}
