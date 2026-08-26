"use client";

import { useRouter } from "next/navigation";
import { RouteGuard } from "@/components/RouteGuard";
import { LiveCreateForm } from "./_components/LiveCreateForm";

export default function NewLivePage() {
  const router = useRouter();

  return (
    <RouteGuard require="SELLER">
      <LiveCreateForm
        onCreated={(created) =>
          router.push(`/live/${created.live.publicId}/studio`)
        }
      />
    </RouteGuard>
  );
}
