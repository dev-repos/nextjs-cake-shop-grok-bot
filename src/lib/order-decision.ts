/** Shared (client + server) types and limits for the bakery's accept/decline forms. */

export const REASON_MIN = 5;
export const REASON_MAX = 300;

export type DecisionState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldError?: string };
