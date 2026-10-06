import "server-only";
import type { OrderPageError } from "@/components/OrderSummary";
import { getOutcome, type Outcome } from "@/lib/server/order-outcome";
import { type OrderPayload, verifyOrderLink } from "@/lib/server/order-token";

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export type DecisionPage =
  | { kind: "error"; reason: OrderPageError; order?: OrderPayload; at?: number }
  | { kind: "done"; order: OrderPayload; outcome: Outcome }
  | { kind: "ready"; order: OrderPayload; d: string; sig: string };

/**
 * Work out what an accept/decline page should show:
 * - error: bad signature, wrong order, expired, or already used on this device
 * - done: the action just succeeded (`result` matches the signed outcome cookie)
 * - ready: show the form
 */
export async function loadDecisionPage(
  purpose: "accept" | "decline",
  number: string,
  query: Record<string, string | string[] | undefined>,
): Promise<DecisionPage> {
  const d = first(query.d);
  const sig = first(query.sig);
  const result = verifyOrderLink(purpose, number, d, sig);
  if (!result.ok) return { kind: "error", reason: result.reason };

  const outcome = await getOutcome(result.order.n);
  if (outcome) {
    const justDone = first(query.result) === outcome.action && outcome.action === (purpose === "accept" ? "confirmed" : "declined");
    return justDone
      ? { kind: "done", order: result.order, outcome }
      : { kind: "error", reason: outcome.action, order: result.order, at: outcome.at };
  }
  return { kind: "ready", order: result.order, d: d!, sig: sig! };
}
