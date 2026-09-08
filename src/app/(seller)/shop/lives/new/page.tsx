"use client";

import { useRouter } from "next/navigation";
import { LiveForm } from "../_components/LiveForm";

export default function NewLivePage() {
  const router = useRouter();

  return (
    <LiveForm
      mode={{ type: "create" }}
      onSaved={(live) => router.push(`/shop/lives/${live.publicId}/studio`)}
    />
  );
}
