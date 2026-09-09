"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { CustomerInfoForm } from "@/components/forms/CustomerInfoForm";
import { submitCustomerOnboarding } from "@/lib/user";

//구매자가 기본 정보(이름, 닉네임, 연락처, 배송지)를 입력하는 온보딩 컴포넌트
export function CustomerOnboardingForm() {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: submitCustomerOnboarding,
    onSuccess: () => {
      // role 을 여기서 바꾸면 아직 (onboarding) 안이라 그 가드가 먼저 반응해
      // 완료 화면 대신 제 역할의 홈으로 밀어낸다. 갱신은 도착한 화면에 맡긴다.
      router.replace("/onboarding/customer/complete");
    },
  });

  return (
    <CustomerInfoForm
      submitLabel={mutation.isPending ? "등록 중…" : "다음"}
      isPending={mutation.isPending}
      onSubmit={mutation.mutate}
    />
  );
}
