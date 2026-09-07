"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { BottomButton } from "@/components/buttons/BottomButton";
import { Input } from "@/components/inputs/Input";
import { PostalInput, type PostalValue } from "@/components/inputs/PostalInput";
import { useNicknameCheck } from "@/hooks/use-nickname-check";
import { submitCustomerOnboarding } from "@/lib/user";

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
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [postal, setPostal] = useState<PostalValue>(EMPTY_POSTAL);

  // 이름·연락처는 각 필드가 형식 검증과 에러 표시를 함께 맡는다.
  // 닉네임은 형식 검증에 더해 중복 조회까지 통과해야 한다.
  const { verified: nicknameVerified, ...nicknameState } =
    useNicknameCheck(nickname);

  const mutation = useMutation({
    mutationFn: submitCustomerOnboarding,
    onSuccess: () => {
      // role 을 여기서 바꾸면 아직 (onboarding) 안이라 그 가드가 먼저 반응해
      // 완료 화면 대신 제 역할의 홈으로 밀어낸다. 갱신은 도착한 화면에 맡긴다.
      router.replace("/onboarding/customer/complete");
    },
  });

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
        label={mutation.isPending ? "등록 중…" : "다음"}
        disabled={!canSubmit || mutation.isPending}
        onClick={() => {
          mutation.mutate({
            name,
            nickname,
            phoneNumber: phone,
            // canSubmit 이 addressType 이 빈 값인 배송지를 이미 걸러낸다.
            address: {
              ...postal,
              addressType: postal.addressType as "R" | "J",
            },
          });
        }}
      />
    </>
  );
}
