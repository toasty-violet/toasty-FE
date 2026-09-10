"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { BottomButton } from "@/components/buttons/BottomButton";
import { Input } from "@/components/inputs/Input";
import { Textarea } from "@/components/inputs/Textarea";
import { useNicknameCheck } from "@/hooks/use-nickname-check";
import { fetchSuggestedShopName } from "@/lib/user";

import {
  hasSellerInfoStep,
  readSellerDraft,
  saveSellerDraft,
  type SellerOnboardingDraft,
} from "../_lib/seller-onboarding-draft";
import { ShopImageField } from "./ShopImageField";

//셀러가 스토어 사진·이름·소개를 입력하는 온보딩 첫 단계 컴포넌트
export function SellerInfoForm() {
  const router = useRouter();
  // RouteGuard 가 판정을 마친 뒤에야 마운트되는 클라이언트 전용 화면이라
  // 첫 렌더에서 바로 sessionStorage 를 읽어도 서버 렌더와 어긋나지 않는다.
  const [draft, setDraft] = useState<SellerOnboardingDraft>(readSellerDraft);

  // 추천 샵 이름이 아직 유저의 것이 아니기 때문에 그대로 조회한다.
  const { verified: shopNameVerified, ...shopNameCheck } = useNicknameCheck(
    draft.shopName,
    "shopName",
    true,
  );

  const update = (patch: Partial<SellerOnboardingDraft>) =>
    setDraft((prev) => ({ ...prev, ...patch }));

  // 빈 입력창에 채워 둘 예시 이름을 받아 온다. 이미 닉네임이 설정돼 있다면 해당 닉네임이 노출된다.
  // 실패하면 빈 입력창으로 둔다. 마운트 때 한 번만 본다. 유저가 지워서 다시 비어도 새로 받지 않는다.
  // 타이핑은 초안 state 만 바꾸므로, 응답이 오는 사이 적은 값이 있는지는 그쪽으로 확인한다.
  useEffect(() => {
    if (readSellerDraft().shopName !== "") return;

    fetchSuggestedShopName()
      .then((shopName) =>
        setDraft((prev) =>
          prev.shopName === "" ? { ...prev, shopName } : prev,
        ),
      )
      .catch(() => {});
  }, []);

  const handleNext = () => {
    saveSellerDraft(draft);
    router.push("/onboarding/seller/info-2");
  };

  // 사진·이름·소개 모두 필수, 이름은 중복 조회까지 통과해야 한다.
  const canSubmit = hasSellerInfoStep(draft) && shopNameVerified;

  return (
    <>
      <div className="flex flex-1 flex-col gap-28 px-20 pb-56">
        <ShopImageField
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
