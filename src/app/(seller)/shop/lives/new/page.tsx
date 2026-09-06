"use client";

import { useRouter } from "next/navigation";
import { LiveCreateForm } from "./_components/LiveCreateForm";

export default function NewLivePage() {
  const router = useRouter();

  return (
    <LiveCreateForm
      onCreated={(created) =>
        router.push(`/shop/lives/${created.live.publicId}/studio`)
      }
    />
  );
}
