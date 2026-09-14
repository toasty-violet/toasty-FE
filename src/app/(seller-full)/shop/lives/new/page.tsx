"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { LiveForm } from "@/app/live/_components/LiveForm";

export default function NewLivePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return (
    <LiveForm
      mode={{ type: "create" }}
      onSaved={() => {
        queryClient.invalidateQueries({ queryKey: ["seller-live-tab"] });
        // 만든 라이브는 예정 상태라 바로 송출할 일이 없다.
        // 이미 만들어진 뒤라 뒤로가기로 작성 화면에 돌아오지 않게 replace 한다.
        router.replace("/shop/lives");
      }}
    />
  );
}
