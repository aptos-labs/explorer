/**
 * Planned client-side transaction flow tracker (FEAT-TXN-016).
 *
 * Walking nested Move calls in the browser (module ABIs, resource reads,
 * optional simulation / view calls) would reconstruct hops the event log
 * does not spell out. That path is **not** enabled: it would issue extra
 * REST and view requests per transaction and compete with the rest of the
 * explorer for Geomi quota.
 *
 * The Payments tab identifies payments from the transaction body (and the
 * Balance Change indexer query already in flight). Flip `enabled` only with
 * an explicit product decision and a per-tab opt-in.
 */

import type {
  IdentifyPaymentsInput,
  PaymentFlowSource,
  PaymentIdentification,
} from "./types";

export const CLIENT_SIDE_PAYMENT_TRACKER = {
  source: "client_trace" as const satisfies PaymentFlowSource,
  enabled: false as const,
  reason:
    "A client-side call-graph walk would multiply REST/view API usage per transaction.",
};

/**
 * Hook for a future tracker. Always returns `undefined` while `enabled` is
 * false so callers keep using `identifyPayments` on the transaction body.
 */
export function identifyPaymentsFromClientTrace(
  _input: IdentifyPaymentsInput,
): PaymentIdentification | undefined {
  if (!CLIENT_SIDE_PAYMENT_TRACKER.enabled) {
    return undefined;
  }
  return undefined;
}
