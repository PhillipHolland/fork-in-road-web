import { Suspense } from "react";
import RedirectClient from "./RedirectClient";

export default function Redirect() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RedirectClient />
    </Suspense>
  );
}