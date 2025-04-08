import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function RedirectPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q;

  if (q) {
    redirect(`https://grok.com/?q=${encodeURIComponent(q)}`);
  }

  return (
    <div>
      <p>Redirecting to Grok...</p>
    </div>
  );
}