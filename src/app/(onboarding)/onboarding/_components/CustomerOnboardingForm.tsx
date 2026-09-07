"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { BottomButton } from "@/components/buttons/BottomButton";
import { Input } from "@/components/inputs/Input";
import { PostalInput, type PostalValue } from "@/components/inputs/PostalInput";
import { useNicknameCheck } from "@/hooks/use-nickname-check";

import {
  loadOnboardingDraft,
  saveOnboardingDraft,
} from "../_lib/onboarding-draft";
import { NAME_PATTERN, PHONE_PATTERN } from "../_lib/validation";
import { NameField } from "./NameField";
import { PhoneField } from "./PhoneField";

const EMPTY_POSTAL: PostalValue = {
  postalCode: "",
  roadAddress: "",
  jibunAddress: "",
  addressType: "",
  buildingName: "",
  legalDong: "",
  detailAddress: "",
};

//구매자가 기본 정보(이름, 닉네임, 연락처, 배송지)를 입력하는 온보딩 컴포넌트
export function CustomerOnboardingForm() {
  const router = useRouter();
  // 결제 등록 화면에서 되돌아온 경우 앞서 입력한 값으로 시작한다.
  const [initial] = useState(loadOnboardingDraft);
  const [name, setName] = useState(initial?.name ?? "");
  const [nickname, setNickname] = useState(initial?.nickname ?? "");
  const [phone, setPhone] = useState(initial?.phoneNumber ?? "");
  const [postal, setPostal] = useState<PostalValue>(
    initial?.address ?? EMPTY_POSTAL,
  );

  // 이름·연락처는 각 필드가 형식 검증과 에러 표시를 함께 맡는다.
  // 닉네임은 형식 검증에 더해 중복 조회까지 통과해야 한다.
  const { verified: nicknameVerified, ...nicknameState } =
    useNicknameCheck(nickname);

  // 우편번호 검색을 마쳐야 배송지가 확정된다.
  const canSubmit =
    NAME_PATTERN.test(name) &&
    nicknameVerified &&
    PHONE_PATTERN.test(phone) &&
    postal.postalCode !== "" &&
    postal.addressType !== "";

  return (
    <>
      <div className="flex flex-1 flex-col gap-28 px-20 pb-56">
        <NameField value={name} onChange={setName} title="이름" />

        <Input
          {...nicknameState}
          value={nickname}
          onChange={setNickname}
          title="닉네임"
          placeholder="닉네임을 입력해 주세요."
          message="2~20자 이내"
          maxLetter={20}
        />

        <PhoneField value={phone} onChange={setPhone} title="연락처" />

        <PostalInput value={postal} onChange={setPostal} />
      </div>

      <BottomButton
        label="다음"
        disabled={!canSubmit}
        onClick={() => {
          // 온보딩은 결제 등록까지 마쳐야 제출하므로, 여기서는 보관만 한다.
          saveOnboardingDraft({
            name,
            nickname,
            phoneNumber: phone,
            // canSubmit 이 addressType 이 빈 값인 배송지를 이미 걸러낸다.
            address: {
              ...postal,
              addressType: postal.addressType as "R" | "J",
            },
          });
          router.push("/onboarding/customer/payment-register");
        }}
      />
    </>
  );
}
