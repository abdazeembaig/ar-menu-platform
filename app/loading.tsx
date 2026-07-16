export default function Loading() {
  return (
    <main className="app-shell min-h-screen py-6">
      <div className="h-64 animate-pulse rounded-[28px] bg-border" />
      <div className="mt-6 space-y-3">
        <div className="h-6 w-2/3 animate-pulse rounded bg-border" />
        <div className="h-12 animate-pulse rounded-full bg-border" />
        <div className="grid gap-3 md:grid-cols-2">
          <div className="h-36 animate-pulse rounded-[var(--radius-brand)] bg-border" />
          <div className="h-36 animate-pulse rounded-[var(--radius-brand)] bg-border" />
          <div className="h-36 animate-pulse rounded-[var(--radius-brand)] bg-border" />
          <div className="h-36 animate-pulse rounded-[var(--radius-brand)] bg-border" />
        </div>
      </div>
    </main>
  );
}
