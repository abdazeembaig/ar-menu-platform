import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="app-shell grid min-h-screen place-items-center py-12">
      <section className="max-w-md rounded-[var(--radius-brand)] border border-border bg-surface p-6 text-center shadow-sm">
        <h1 className="text-2xl font-black">You are offline</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Cached menu screens may still be available. Submitting an order, calling a waiter, or requesting the bill requires internet connectivity.
        </p>
        <Link href="/r/brunch-cafe/t/T12/" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-extrabold text-white">
          Back to cached demo
        </Link>
      </section>
    </main>
  );
}
