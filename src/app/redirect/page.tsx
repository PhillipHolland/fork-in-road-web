import { redirect } from "next/navigation";
import type { NextPage } from "next";

export const dynamic = "force-dynamic";

interface RedirectPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

const RedirectPage: NextPage<RedirectPageProps> = ({ searchParams }) => {
  const q = searchParams.q;

  if (q) {
    const query = typeof q === "string" ? q : Array.isArray(q) ? q[0] : "";
    redirect(`https://grok.com/?q=${encodeURIComponent(query)}`);
  }

  return (
    <div>
      <p>Redirecting to Grok...</p>
    </div>
  );
};

export default RedirectPage;