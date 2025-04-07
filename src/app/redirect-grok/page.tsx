import { Suspense } from "react";
import RedirectGrok from "./RedirectGrok";

export default function Redirect() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RedirectGrok />
    </Suspense>
  );
}