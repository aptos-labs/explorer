import {truncateAddress} from "../../../utils";
import type {PaymentFlowGraph} from "./types";

/** Strip characters that would break a Mermaid node/edge label. */
export function escapeMermaidLabel(value: string): string {
  return value
    .replace(/["#[\]{}|]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

export function mermaidNodeId(raw: string): string {
  const compact = raw.replace(/[^a-zA-Z0-9]/g, "");
  const id = compact.length > 0 ? compact.slice(0, 24) : "node";
  return id.match(/^[A-Za-z]/) ? id : `n${id}`;
}

export function shortPaymentLabel(address: string): string {
  return truncateAddress(address);
}

/**
 * Mermaid `flowchart LR` for a payment graph. Rendered visually by
 * `PaymentFlowDiagram` (no mermaid runtime — keeps CSP, SSR, and bundle size
 * unchanged). The source is shown so users can copy it into any Mermaid viewer.
 */
export function paymentFlowToMermaid(flow: PaymentFlowGraph): string {
  const lines = ["flowchart LR"];
  const seen = new Set<string>();
  for (const node of flow.nodes) {
    if (seen.has(node.id)) continue;
    seen.add(node.id);
    const label = escapeMermaidLabel(node.label);
    lines.push(`  ${node.id}["${label}"]`);
  }
  for (const edge of flow.edges) {
    const label = escapeMermaidLabel(edge.label) || "payment";
    lines.push(`  ${edge.from} -->|"${label}"| ${edge.to}`);
  }
  return lines.join("\n");
}

/** Non-fee legs in the payment graph (swap in/out, partner hops, etc.). */
export function paymentLegCount(flow: PaymentFlowGraph): number {
  return flow.edges.filter((edge) => edge.kind !== "fee").length;
}

/**
 * Show a flow diagram when the transaction has multiple payment steps, or a
 * single step with multiple legs (for example a swap's input and output).
 * Network-fee edges alone do not trigger the diagram.
 */
export function shouldRenderPaymentMermaid(
  stepCount: number,
  paymentLegs = 0,
): boolean {
  return stepCount >= 2 || paymentLegs >= 2;
}
