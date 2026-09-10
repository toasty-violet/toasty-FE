"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { CustomerInfoForm } from "@/components/forms/CustomerInfoForm";

import {
  loadOnboardingDraft,
  saveOnboardingDraft,
} from "../_lib/onboarding-draft";

//구매자가 기본 정보(이름, 닉네임, 연락처, 배송지)를 입력하는 온보딩 컴포넌트
export function CustomerOnboardingForm() {
  const router = useRouter();
  // 결제 등록 화면에서 되돌아온 경우 앞서 입력한 값으로 시작한다.
  const [draft] = useState(loadOnboardingDraft);

  return (
    <CustomerInfoForm
      initialValues={draft ?? undefined}
      submitLabel="다음"
      onSubmit={(values) => {
        // 온보딩은 결제 등록까지 마쳐야 제출하므로, 여기서는 보관만 한다.
        saveOnboardingDraft(values);
        router.push("/onboarding/customer/payment-register");
      }}
    />
  );
}
