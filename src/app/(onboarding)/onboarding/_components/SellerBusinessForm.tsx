"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { BottomButton } from "@/components/buttons/BottomButton";
import { Input } from "@/components/inputs/Input";
import { submitSellerOnboarding } from "@/lib/user";

import {
  clearSellerDraft,
  readSellerDraft,
  saveSellerDraft,
  type SellerOnboardingDraft,
} from "../_lib/seller-onboarding-draft";
import { NAME_PATTERN, PHONE_PATTERN, onlyDigits } from "../_lib/validation";
import { BankSelectField } from "./BankSelectField";
import { NameField } from "./NameField";
import { PhoneField } from "./PhoneField";

const BUSINESS_NUMBER_PATTERN = /^[0-9]{10}$/;

//셀러가 대표자·사업자·정산 계좌 정보를 입력하는 온보딩 마지막 단계 컴포넌트
export function SellerBusinessForm() {
  const router = useRouter();
  // RouteGuard 가 판정을 마친 뒤에야 마운트되는 클라이언트 전용 화면이라
  // 첫 렌더에서 바로 localStorage 를 읽어도 서버 렌더와 어긋나지 않는다.
  const [draft, setDraft] = useState<SellerOnboardingDraft>(readSellerDraft);

  const update = (patch: Partial<SellerOnboardingDraft>) =>
    setDraft((prev) => ({ ...prev, ...patch }));

  const submit = useMutation({
    mutationFn: submitSellerOnboarding,
    onSuccess: () => {
      clearSellerDraft();
      // role 을 여기서 SELLER 로 바꾸면 아직 (onboarding) 안이라 그 가드가 먼저
      // 반응해 /shop 으로 밀어낸다. 갱신은 도착한 완료 화면에 맡긴다.
      router.replace("/onboarding/seller/complete");
    },
  });

  // 입력을 시작하기 전까지는 에러를 띄우지 않는다.
  const businessNumberError =
    draft.businessNumber !== "" &&
    !BUSINESS_NUMBER_PATTERN.test(draft.businessNumber);

  // 사업자 번호는 선택 입력이라, 비었거나 형식이 맞으면 통과한다.
  const canSubmit =
    NAME_PATTERN.test(draft.representativeName) &&
    PHONE_PATTERN.test(draft.representativePhone) &&
    !businessNumberError &&
    draft.bank !== "" &&
    draft.accountNumber !== "";

  const handleSubmit = () => {
    // 실패했을 때 되돌아와도 입력값이 남도록 보내기 전에 저장한다.
    saveSellerDraft(draft);
    submit.mutate({
      shopName: draft.shopName,
      description: draft.description,
      shopImageObjectKey: draft.shopImageObjectKey,
      sellerName: draft.representativeName,
      phoneNumber: draft.representativePhone,
      businessNumber: draft.businessNumber,
      bank: draft.bank,
      accountNumber: draft.accountNumber,
    });
  };

  return (
    <>
      <div className="flex flex-1 flex-col gap-28 px-20 pb-56">
        <NameField
          value={draft.representativeName}
          onChange={(representativeName) => update({ representativeName })}
          title="대표자 이름"
        />

        <PhoneField
          value={draft.representativePhone}
          onChange={(representativePhone) => update({ representativePhone })}
          title="대표자 연락처"
        />

        <Input
          value={draft.businessNumber}
          onChange={(value) => update({ businessNumber: onlyDigits(value) })}
          title="사업자 번호(선택)"
          placeholder="사업자 번호를 입력해 주세요."
          error={businessNumberError}
          errorMessage="사업자 번호 10자리를 입력해 주세요."
          inputMode="numeric"
        />

        <BankSelectField
          bank={draft.bank}
          onBankChange={(bank) => update({ bank })}
          accountNumber={draft.accountNumber}
          onAccountNumberChange={(value) =>
            update({ accountNumber: onlyDigits(value) })
          }
        />

        {submit.isError && (
          <p className="text-c1-medium text-fg-critical">
            입점 신청에 실패했어요. 다시 시도해 주세요.
          </p>
        )}
      </div>

      <BottomButton
        label="입점 신청하기"
        onClick={handleSubmit}
        disabled={!canSubmit || submit.isPending}
      />
    </>
  );
}
