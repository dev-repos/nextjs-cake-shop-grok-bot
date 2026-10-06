"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { submitOrder } from "@/app/checkout/actions";
import { CartLines } from "@/components/CartLines";
import { formatDate, localIsoDate, MIN_LEAD_DAYS } from "@/lib/cakes";
import { cartTotal, clearCart, useCart } from "@/lib/cart";
import type { CheckoutField, CheckoutState } from "@/lib/order";
import { NO_PAYMENT_NOTE, NOTES_MAX } from "@/lib/order-config";
import { usd } from "@/lib/site";

const noopSubscribe = () => () => {};
const initialState: CheckoutState = { status: "idle" };

type Values = { name: string; phone: string; email: string; pickupDate: string; notes: string };

export function CheckoutForm() {
  const lines = useCart();
  const router = useRouter();
  const [state, formAction, pending] = useActionState(submitOrder, initialState);
  const minDate = useSyncExternalStore(noopSubscribe, () => localIsoDate(new Date(), MIN_LEAD_DAYS), () => "");
  const [values, setValues] = useState<Values>({ name: "", phone: "", email: "", pickupDate: "", notes: "" });
  const [dateTouched, setDateTouched] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const baseId = useId();

  // Suggest the latest pickup date requested in the customiser, if it's still valid.
  const suggestedDate =
    lines
      ?.map((l) => l.choices.date)
      .filter((d) => d && minDate && d >= minDate)
      .sort()
      .at(-1) ?? "";
  const pickupDate = dateTouched ? values.pickupDate : values.pickupDate || suggestedDate;

  useEffect(() => {
    if (state.status === "ok") {
      clearCart();
      router.push(state.orderPath);
    } else if (state.status === "error") {
      summaryRef.current?.focus();
    }
  }, [state, router]);

  if (lines === null) {
    return <div aria-hidden="true" className="mt-6 h-96 animate-pulse rounded-3xl bg-cream-100" />;
  }

  if (state.status === "ok") {
    return (
      <p role="status" className="mt-6 rounded-3xl bg-white p-6 text-cocoa-800 shadow-sm ring-1 ring-cocoa-900/5">
        Order {state.orderNumber} sent. Opening your order page…
      </p>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mt-6 rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-cocoa-900/5">
        <p className="text-lg font-semibold text-cocoa-900">Your cart is empty</p>
        <Link href="/cakes" className="mt-4 inline-flex min-h-12 items-center rounded-full bg-raspberry-600 px-6 font-semibold text-white">
          Browse cakes
        </Link>
      </div>
    );
  }

  const errors = state.status === "error" ? state.fieldErrors : {};
  const errorList = Object.entries(errors).filter(([key]) => key !== "items") as [CheckoutField, string][];
  const formError = state.status === "error" ? state.formError : undefined;
  const id = (field: string) => `${baseId}-${field}`;
  const set = (field: keyof Values) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [field]: event.target.value }));

  const items = JSON.stringify(
    lines.map((l) => ({
      slug: l.slug,
      size: l.choices.size,
      flavour: l.choices.flavour,
      frosting: l.choices.frosting,
      message: l.choices.message,
      qty: l.qty,
    })),
  );

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
      <section aria-labelledby={id("summary-h")} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-cocoa-900/5 lg:order-2 lg:sticky lg:top-20">
        <div className="flex items-baseline justify-between">
          <h2 id={id("summary-h")} className="text-lg font-semibold text-cocoa-900">
            Your cakes
          </h2>
          <Link href="/cart" className="-my-2.5 inline-flex min-h-11 items-center text-sm font-medium text-raspberry-700 hover:underline">
            Edit cart
          </Link>
        </div>
        <div className="mt-4">
          <CartLines lines={lines} editable={false} />
        </div>
        <div className="mt-4 flex items-baseline justify-between border-t border-cocoa-900/10 pt-4">
          <span className="font-semibold text-cocoa-900">Total</span>
          <span className="font-display text-3xl font-semibold text-cocoa-900 tabular-nums">{usd(cartTotal(lines))}</span>
        </div>
      </section>

      <form action={formAction} noValidate className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-cocoa-900/5 lg:order-1">
        <div ref={summaryRef} tabIndex={-1} className="outline-none">
          {formError || errorList.length > 0 ? (
            <div role="alert" className="mb-5 rounded-2xl border border-raspberry-600/40 bg-raspberry-100 p-4 text-sm text-raspberry-700">
              <p className="font-semibold">{formError ?? "Please check the highlighted fields."}</p>
              {errorList.length > 0 ? (
                <ul className="mt-1 list-disc pl-5">
                  {errorList.map(([field, message]) => (
                    <li key={field}>
                      <a href={`#${id(field)}`} className="inline-flex min-h-11 items-center underline">
                        {message}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>

        <input type="hidden" name="items" value={items} />

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id={id("name")} label="Name" error={errors.name} className="sm:col-span-2">
            <input id={id("name")} name="name" type="text" autoComplete="name" required maxLength={80} value={values.name} onChange={set("name")} {...invalid(errors.name, id("name"))} className={inputClass(errors.name)} />
          </Field>
          <Field id={id("phone")} label="Phone" error={errors.phone}>
            <input id={id("phone")} name="phone" type="tel" inputMode="tel" autoComplete="tel" required maxLength={20} placeholder="+1 503 555 0142" value={values.phone} onChange={set("phone")} {...invalid(errors.phone, id("phone"))} className={inputClass(errors.phone)} />
          </Field>
          <Field id={id("email")} label="Email" error={errors.email}>
            <input id={id("email")} name="email" type="email" inputMode="email" autoComplete="email" required maxLength={120} placeholder="you@example.com" value={values.email} onChange={set("email")} {...invalid(errors.email, id("email"))} className={inputClass(errors.email)} />
          </Field>
          <Field
            id={id("pickupDate")}
            label="Pickup date"
            error={errors.pickupDate}
            hint={minDate ? `At least ${MIN_LEAD_DAYS} days from today: ${formatDate(minDate)} or later. All cakes are picked up together.` : undefined}
            className="sm:col-span-2"
          >
            <input
              id={id("pickupDate")}
              name="pickupDate"
              type="date"
              required
              min={minDate || undefined}
              value={pickupDate}
              onChange={(e) => {
                setDateTouched(true);
                setValues((v) => ({ ...v, pickupDate: e.target.value }));
              }}
              {...invalid(errors.pickupDate, id("pickupDate"), true)}
              className={inputClass(errors.pickupDate)}
            />
          </Field>
          <Field id={id("notes")} label="Notes" optional error={errors.notes} hint={`Allergies, colours, anything we should know. ${values.notes.length}/${NOTES_MAX}`} className="sm:col-span-2">
            <textarea id={id("notes")} name="notes" rows={4} maxLength={NOTES_MAX} value={values.notes} onChange={set("notes")} {...invalid(errors.notes, id("notes"), true)} className={`${inputClass(errors.notes)} py-3`} />
          </Field>
        </div>

        <p className="mt-6 rounded-2xl bg-cream-100 p-4 text-sm font-medium text-cocoa-800">{NO_PAYMENT_NOTE}</p>

        <button
          type="submit"
          disabled={pending}
          className="mt-5 flex min-h-12 w-full items-center justify-center rounded-full bg-raspberry-600 px-6 font-semibold text-white shadow-lg shadow-raspberry-600/25 hover:bg-raspberry-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-raspberry-600 disabled:opacity-60"
        >
          {pending ? "Sending your request…" : "Send order request"}
        </button>
      </form>
    </div>
  );
}

function invalid(error: string | undefined, fieldId: string, hasHint = false) {
  const describedBy = [error ? `${fieldId}-error` : null, hasHint ? `${fieldId}-hint` : null].filter(Boolean).join(" ");
  return {
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy || undefined,
  } as const;
}

function inputClass(error?: string) {
  return `block min-h-12 w-full rounded-2xl border bg-cream-50 px-4 text-base text-cocoa-900 placeholder:text-cocoa-500/60 focus:outline-2 focus:outline-offset-1 focus:outline-raspberry-600 ${
    error ? "border-raspberry-600" : "border-cocoa-900/20"
  }`;
}

function Field({
  id,
  label,
  optional,
  hint,
  error,
  className = "",
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block font-semibold text-cocoa-900">
        {label} {optional ? <span className="text-sm font-normal text-cocoa-500">(optional)</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-medium text-raspberry-700">
          {error}
        </p>
      ) : null}
      {hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-cocoa-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
