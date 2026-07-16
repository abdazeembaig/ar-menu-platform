import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <main className="app-shell grid min-h-screen place-items-center py-12">
      <section className="max-w-md rounded-[var(--radius-brand)] border border-border bg-surface p-6 text-center shadow-sm">
        <Image src="/logo.svg" alt="" width={64} height={64} className="mx-auto rounded-2xl" />
        <h1 className="mt-5 text-2xl font-black">Invalid QR code</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          This restaurant or table could not be resolved. Please ask the restaurant team for a fresh table QR code.
        </p>
        <Link href="/r/brunch-cafe/t/T12/" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-extrabold text-white">
          Open demo table
        </Link>
      </section>
    </main>
  );
}
