"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { BottomButton } from "@/components/buttons/BottomButton";
import { Input } from "@/components/inputs/Input";
import { Textarea } from "@/components/inputs/Textarea";
import { useNicknameCheck } from "@/hooks/use-nickname-check";

import {
  readSellerDraft,
  saveSellerDraft,
  type SellerOnboardingDraft,
} from "../../_lib/seller-onboarding-draft";
import { StoreImageField } from "./StoreImageField";

//셀러가 스토어 사진·이름·소개를 입력하는 온보딩 첫 단계 컴포넌트
export function SellerInfoForm() {
  const router = useRouter();
  // RouteGuard 가 판정을 마친 뒤에야 마운트되는 클라이언트 전용 화면이라
  // 첫 렌더에서 바로 localStorage 를 읽어도 서버 렌더와 어긋나지 않는다.
  const [draft, setDraft] = useState<SellerOnboardingDraft>(readSellerDraft);

  // 스토어 이름이 곧 판매자의 닉네임이라 같은 중복 조회를 쓴다.
  // 초안에서 되살린 이름도 아직 아무도 쓰지 않은 값이라 그대로 조회한다.
  const { verified: shopNameVerified, ...shopNameCheck } = useNicknameCheck(
    draft.shopName,
    true,
  );

  const update = (patch: Partial<SellerOnboardingDraft>) =>
    setDraft((prev) => ({ ...prev, ...patch }));

  const handleNext = () => {
    saveSellerDraft(draft);
    router.push("/onboarding/seller/info-2");
  };

  const canSubmit = shopNameVerified;

  return (
    <>
      <div className="flex flex-1 flex-col gap-28 px-20 pt-20 pb-56">
        <h1 className="text-t1-bold text-fg-neutral-solid whitespace-pre-line">
          {"구매자에게 보여질\n스토어 정보를 등록해 주세요"}
        </h1>

        <StoreImageField
          onChange={(shopImageObjectKey) => update({ shopImageObjectKey })}
        />

        <Input
          value={draft.shopName}
          onChange={(shopName) => update({ shopName })}
          title="스토어 이름"
          placeholder="스토어 이름을 입력해 주세요."
          message="2~20자 이내"
          maxLetter={20}
          {...shopNameCheck}
          successMessage="사용 가능한 스토어 이름이에요."
        />

        <Textarea
          value={draft.description}
          onChange={(description) => update({ description })}
          title="스토어 소개"
          placeholder="스토어 소개를 작성해 주세요."
          maxLetter={200}
          autoResize
        />
      </div>

      <BottomButton label="다음" onClick={handleNext} disabled={!canSubmit} />
    </>
  );
}
