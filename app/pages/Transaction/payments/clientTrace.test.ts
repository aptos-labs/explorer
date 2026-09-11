// Covers FEAT-TXN-016 — client-side payment tracker stays opt-in / unused
import {describe, expect, it} from "vitest";
import {
  CLIENT_SIDE_PAYMENT_TRACKER,
  identifyPaymentsFromClientTrace,
} from "./clientTrace";

describe("FEAT-TXN-016 — client-side tracker stub", () => {
  it("is disabled so the Payments tab does not issue extra REST/view calls", () => {
    expect(CLIENT_SIDE_PAYMENT_TRACKER.enabled).toBe(false);
    expect(CLIENT_SIDE_PAYMENT_TRACKER.source).toBe("client_trace");
    expect(
      identifyPaymentsFromClientTrace({
        transaction: {type: "user_transaction"} as never,
      }),
    ).toBeUndefined();
  });
});
