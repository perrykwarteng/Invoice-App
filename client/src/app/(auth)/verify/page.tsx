import { Suspense } from "react";
import VerifyForm from "./VerifyForm.tsx";

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyForm />
    </Suspense>
  );
}
