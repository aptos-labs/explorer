import {describe, expect, it, vi} from "vitest";
import {mapWithConcurrencyLimit} from "./mapWithConcurrencyLimit";

describe("mapWithConcurrencyLimit", () => {
  it("returns empty array for empty input", async () => {
    expect(await mapWithConcurrencyLimit([], 3, async () => 1)).toEqual([]);
  });

  it("preserves order with concurrency 1", async () => {
    const out = await mapWithConcurrencyLimit(
      [3, 2, 1],
      1,
      async (n) => n * 10,
    );
    expect(out).toEqual([30, 20, 10]);
  });

  it("respects max concurrency", async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    const fn = vi.fn(async (n: number) => {
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((r) => setTimeout(r, 5));
      inFlight -= 1;
      return n;
    });
    await mapWithConcurrencyLimit([1, 2, 3, 4, 5], 2, fn);
    expect(maxInFlight).toBeLessThanOrEqual(2);
    expect(fn).toHaveBeenCalledTimes(5);
  });

  it("treats concurrency below 1 as 1", async () => {
    const out = await mapWithConcurrencyLimit([1, 2], 0, async (n) => n);
    expect(out).toEqual([1, 2]);
  });
});
