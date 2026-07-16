"use client";

import { useState } from "react";
import { ConciergeBell, ReceiptText, X } from "lucide-react";
import { useLocale } from "@/components/layout/locale-provider";
import { formatMoney } from "@/lib/cart-math";
import { submitBillRequest, submitServiceRequest } from "@/services/client-order-service";
import type { Branch, Restaurant, ServiceRequest, Table, TableSession } from "@/types/domain";
import { getText } from "@/lib/i18n";

interface ServiceActionsProps {
  restaurant: Restaurant;
  branch: Branch;
  table: Table;
  session: TableSession;
  currentTotal: number;
  compact?: boolean;
}

type DialogMode = "waiter" | "bill" | null;

export function ServiceActions({
  restaurant,
  branch,
  table,
  session,
  currentTotal,
  compact = false,
}: ServiceActionsProps) {
  const { locale, t } = useLocale();
  const [mode, setMode] = useState<DialogMode>(null);
  const [requestType, setRequestType] = useState<ServiceRequest["type"]>("general");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const close = () => {
    setMode(null);
    setMessage("");
    setLoading(false);
  };

  const sendWaiter = async () => {
    setLoading(true);
    setMessage("");
    try {
      await submitServiceRequest(session.id, table.code, requestType, note);
      setMessage(t("waiterRequestSent"));
    } catch (error) {
      setMessage(error instanceof Error && error.message === "duplicate-waiter-request" ? t("duplicateWaiterRequest") : t("waiterRequestFailed"));
    } finally {
      setLoading(false);
    }
  };

  const sendBill = async () => {
    setLoading(true);
    setMessage("");
    try {
      await submitBillRequest(session.id, table.code, currentTotal);
      setMessage(t("billRequestSent"));
    } catch (error) {
      setMessage(error instanceof Error && error.message === "duplicate-bill-request" ? t("duplicateBillRequest") : t("billRequestFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={compact ? "flex gap-2" : "flex flex-wrap gap-2"}>
        <button
          type="button"
          onClick={() => setMode("waiter")}
          className="touch-target inline-flex items-center justify-center gap-2 rounded-full border border-border bg-surface px-4 text-sm font-bold"
        >
          <ConciergeBell aria-hidden="true" size={17} />
          {!compact ? t("callWaiter") : <span className="sr-only">{t("callWaiter")}</span>}
        </button>
        <button
          type="button"
          onClick={() => setMode("bill")}
          className="touch-target inline-flex items-center justify-center gap-2 rounded-full border border-border bg-surface px-4 text-sm font-bold"
        >
          <ReceiptText aria-hidden="true" size={17} />
          {!compact ? t("requestBill") : <span className="sr-only">{t("requestBill")}</span>}
        </button>
      </div>

      {mode ? (
        <div className="fixed inset-0 z-50 grid items-end bg-primary/40 p-3 md:items-center" role="presentation">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${mode}-dialog-title`}
            className="mx-auto w-full max-w-md rounded-[28px] border border-border bg-surface p-5 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id={`${mode}-dialog-title`} className="text-xl font-black">
                  {mode === "waiter" ? t("callWaiterTitle") : t("billRequestTitle")}
                </h2>
                <p className="mt-1 text-sm font-semibold text-muted">
                  {getText(restaurant.name, locale)} · {getText(branch.name, locale)} · {t("table")} {table.number}
                </p>
              </div>
              <button type="button" onClick={close} className="touch-target grid place-items-center rounded-full" aria-label={t("close")}>
                <X aria-hidden="true" size={19} />
              </button>
            </div>

            {mode === "waiter" ? (
              <div className="mt-5 space-y-4">
                <fieldset className="space-y-2">
                  <legend className="text-sm font-black">{t("requestType")}</legend>
                  {[
                    ["general", t("generalAssistance")],
                    ["water", t("water")],
                    ["cutlery", t("cutlery")],
                    ["issue", t("reportIssue")],
                  ].map(([value, label]) => (
                    <label key={value} className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3 text-sm font-bold">
                      {label}
                      <input
                        type="radio"
                        name="waiter-request"
                        checked={requestType === value}
                        onChange={() => setRequestType(value as ServiceRequest["type"])}
                        className="size-5 accent-[var(--color-accent)]"
                      />
                    </label>
                  ))}
                </fieldset>
                <label className="block space-y-2">
                  <span className="text-sm font-black">{t("optionalNote")}</span>
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    className="min-h-24 w-full rounded-2xl border border-border bg-background p-3"
                  />
                </label>
                <button type="button" onClick={sendWaiter} disabled={loading} className="touch-target w-full rounded-full bg-primary px-4 text-sm font-extrabold text-white disabled:bg-zinc-300">
                  {loading ? t("submittingOrder") : t("sendRequest")}
                </button>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <p className="rounded-2xl bg-background p-4 text-sm leading-6 text-muted">{t("requestBillConfirm")}</p>
                <p className="text-lg font-black">{formatMoney(currentTotal, locale)}</p>
                <button type="button" onClick={sendBill} disabled={loading} className="touch-target w-full rounded-full bg-primary px-4 text-sm font-extrabold text-white disabled:bg-zinc-300">
                  {loading ? t("submittingOrder") : t("requestBill")}
                </button>
              </div>
            )}

            <p className="mt-4 min-h-6 text-sm font-bold text-accent" aria-live="polite">
              {message}
            </p>
          </section>
        </div>
      ) : null}
    </>
  );
}
