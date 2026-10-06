"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { confirmOrder, declineOrder } from "@/app/order/[number]/actions";
import { type DecisionState, REASON_MAX, REASON_MIN } from "@/lib/order-decision";

const idle: DecisionState = { status: "idle" };

type LinkFields = { number: string; d: string; sig: string };

function Hidden({ number, d, sig }: LinkFields) {
  return (
    <>
      <input type="hidden" name="number" value={number} />
      <input type="hidden" name="d" value={d} />
      <input type="hidden" name="sig" value={sig} />
    </>
  );
}

function ErrorBox({ state }: { state: DecisionState }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state.status === "error") ref.current?.focus();
  }, [state]);
  return (
    <div ref={ref} tabIndex={-1} className="outline-none">
      {state.status === "error" ? (
        <p role="alert" className="mb-4 rounded-2xl border border-raspberry-600/40 bg-raspberry-100 p-4 font-medium text-raspberry-700">
          {state.message}
        </p>
      ) : null}
    </div>
  );
}

const buttonBase =
  "flex min-h-12 w-full items-center justify-center rounded-full px-6 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 sm:w-auto";

export function ConfirmOrderForm(props: LinkFields) {
  const [state, action, pending] = useActionState(confirmOrder, idle);
  return (
    <form action={action}>
      <ErrorBox state={state} />
      <Hidden {...props} />
      <button
        type="submit"
        disabled={pending}
        className={`${buttonBase} bg-emerald-700 text-white shadow-lg shadow-emerald-700/25 hover:bg-emerald-800 focus-visible:outline-emerald-700`}
      >
        {pending ? "Confirming…" : "Confirm this order"}
      </button>
    </form>
  );
}

export function DeclineOrderForm(props: LinkFields) {
  const [state, action, pending] = useActionState(declineOrder, idle);
  const [reason, setReason] = useState("");
  const id = useId();
  const fieldError = state.status === "error" ? state.fieldError : undefined;
  return (
    <form action={action} noValidate>
      <ErrorBox state={state.status === "error" && !fieldError ? state : idle} />
      <Hidden {...props} />
      <label htmlFor={id} className="mb-1.5 block font-semibold text-cocoa-900">
        Reason for the customer
      </label>
      <textarea
        id={id}
        name="reason"
        rows={3}
        required
        minLength={REASON_MIN}
        maxLength={REASON_MAX}
        autoComplete="off"
        enterKeyHint="send"
        placeholder="e.g. We're fully booked that weekend."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        aria-invalid={fieldError ? true : undefined}
        aria-describedby={`${id}-hint${fieldError ? ` ${id}-error` : ""}`}
        className={`block min-h-24 w-full rounded-2xl border bg-cream-50 px-4 py-3 text-base text-cocoa-900 placeholder:text-cocoa-500/60 focus:outline-2 focus:outline-offset-1 focus:outline-raspberry-600 ${
          fieldError ? "border-raspberry-600" : "border-cocoa-900/20"
        }`}
      />
      {fieldError ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm font-medium text-raspberry-700">
          {fieldError}
        </p>
      ) : null}
      <p id={`${id}-hint`} className="mt-1.5 text-sm text-cocoa-500">
        A short, kind sentence. It&apos;s included in the email to the customer. {reason.length}/{REASON_MAX}
      </p>
      <button
        type="submit"
        disabled={pending}
        className={`${buttonBase} mt-5 bg-raspberry-600 text-white shadow-lg shadow-raspberry-600/25 hover:bg-raspberry-700 focus-visible:outline-raspberry-600`}
      >
        {pending ? "Declining…" : "Decline this order"}
      </button>
    </form>
  );
}
