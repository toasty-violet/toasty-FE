"use client";

import { readSellerDraft } from "../_lib/seller-onboarding-draft";

export default function OnboardingSellerInfo2Page() {
  // 테스트용, info-1 에서 넘어온 값이 무엇인지 확인할 수 있게 그대로 펼쳐 둔다.
  const draft = readSellerDraft();

  return (
    <main className="flex flex-1 flex-col gap-16 px-20 py-20">
      <h1 className="text-t1-bold text-fg-neutral-solid">
        셀러 온보딩 2단계 (/onboarding/seller/info-2)
      </h1>
      <pre className="text-b1-regular bg-bg-neutral-weak rounded-12 overflow-x-auto p-16">
        {JSON.stringify(draft, null, 2)}
      </pre>
    </main>
  );
}
