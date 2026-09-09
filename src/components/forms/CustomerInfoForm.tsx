"use client";

import { useState } from "react";

import { BottomButton } from "@/components/buttons/BottomButton";
import { Input } from "@/components/inputs/Input";
import { NameField } from "@/components/inputs/NameField";
import { PhoneField } from "@/components/inputs/PhoneField";
import { PostalInput, type PostalValue } from "@/components/inputs/PostalInput";
import { useNicknameCheck } from "@/hooks/use-nickname-check";
import { isCompleteAddress } from "@/lib/address";
import { NAME_PATTERN, PHONE_PATTERN } from "@/lib/validation";
import type { CustomerProfile } from "@/types/user";

const EMPTY_POSTAL: PostalValue = {
  postalCode: "",
  roadAddress: "",
  jibunAddress: "",
  addressType: "",
  buildingName: "",
  legalDong: "",
  detailAddress: "",
};

type CustomerInfoFormProps = {
  /** 이미 등록된 정보를 고치는 화면이라면 넘긴다. 없으면 빈 폼으로 시작한다. */
  initialValues?: CustomerProfile;
  submitLabel: string;
  onSubmit: (values: CustomerProfile) => void;
  isPending?: boolean;
};

/**
 * 구매자의 기본 정보(이름, 닉네임, 연락처, 배송지)를 입력받는 폼.
 * 온보딩 등록과 마이페이지 수정이 같은 화면을 쓰므로, 제출 동작만 주입받는다.
 */
export function CustomerInfoForm({
  initialValues,
  submitLabel,
  onSubmit,
  isPending = false,
}: CustomerInfoFormProps) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [nickname, setNickname] = useState(initialValues?.nickname ?? "");
  const [phone, setPhone] = useState(initialValues?.phoneNumber ?? "");
  const [postal, setPostal] = useState<PostalValue>(
    initialValues?.address ?? EMPTY_POSTAL,
  );

  // 이름·연락처는 각 필드가 형식 검증과 에러 표시를 함께 맡는다.
  // 닉네임은 형식 검증에 더해 중복 조회까지 통과해야 한다.
  const { verified: nicknameVerified, ...nicknameState } =
    useNicknameCheck(nickname);

  // 원래 제 닉네임을 그대로 두는 경우는 중복 조회 없이 통과시킨다.
  const nicknameKept =
    initialValues !== undefined && nickname === initialValues.nickname;

  // 우편번호 검색을 마쳐야 배송지가 확정된다.
  const canSubmit =
    NAME_PATTERN.test(name) &&
    (nicknameVerified || nicknameKept) &&
    PHONE_PATTERN.test(phone) &&
    isCompleteAddress(postal);

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
        label={submitLabel}
        disabled={!canSubmit || isPending}
        onClick={() => {
          // canSubmit 이 이미 막지만, 확정된 배송지임을 타입으로도 좁힌다.
          if (!isCompleteAddress(postal)) return;

          onSubmit({
            name,
            nickname,
            phoneNumber: phone,
            address: postal,
          });
        }}
      />
    </>
  );
}
