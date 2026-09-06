"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { BottomButton } from "@/components/buttons/BottomButton";
import { Input } from "@/components/inputs/Input";
import { PostalInput, type PostalValue } from "@/components/inputs/PostalInput";
import { useNicknameCheck } from "@/hooks/use-nickname-check";
import { submitCustomerOnboarding } from "@/lib/user";
import { useUserStore } from "@/store/user-store";

const EMPTY_POSTAL: PostalValue = {
  postalCode: "",
  roadAddress: "",
  jibunAddress: "",
  addressType: "",
  buildingName: "",
  legalDong: "",
  detailAddress: "",
};

const NAME_PATTERN = /^[가-힣a-zA-Z]{2,20}$/;
const PHONE_PATTERN = /^01[016789][0-9]{7,8}$/;

/** 하이픈을 걷어낸 숫자만 남긴다. 검증과 표시 모두 숫자 기준으로 다룬다. */
const onlyDigits = (value: string) => value.replace(/[^0-9]/g, "");

//구매자가 기본 정보(이름, 닉네임, 연락처, 배송지)를 입력하는 온보딩 컴포넌트
export function CustomerOnboardingForm() {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [postal, setPostal] = useState<PostalValue>(EMPTY_POSTAL);

  // 입력을 시작하기 전까지는 에러를 띄우지 않는다.
  const nameError = name !== "" && !NAME_PATTERN.test(name);
  const phoneError = phone !== "" && !PHONE_PATTERN.test(phone);

  // 닉네임은 형식 검증에 더해 중복 조회까지 통과해야 한다.
  const { verified: nicknameVerified, ...nicknameState } =
    useNicknameCheck(nickname);

  const mutation = useMutation({
    mutationFn: submitCustomerOnboarding,
    onSuccess: () => {
      // 역할이 정해졌으므로 store 를 갱신해야 완료 화면의 가드를 통과한다.
      setUser({ role: "CUSTOMER", nickname });
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
      <div className="flex flex-1 flex-col gap-28 px-20 pt-20 pb-56">
        <h1 className="text-t1-bold text-fg-neutral-solid">
          기본 정보를 등록해 주세요
        </h1>

        <Input
          value={name}
          onChange={setName}
          title="이름"
          placeholder="성함을 입력해 주세요."
          maxLetter={20}
          error={nameError}
          errorMessage="한글 또는 영문 2~20자로 입력해 주세요."
          autoComplete="name"
        />

        <Input
          {...nicknameState}
          value={nickname}
          onChange={setNickname}
          title="닉네임"
          placeholder="닉네임을 입력해 주세요."
          message="2~20자 이내"
          maxLetter={20}
        />

        <Input
          value={phone}
          onChange={(value) => setPhone(onlyDigits(value))}
          title="연락처"
          placeholder="휴대폰 번호를 입력해 주세요."
          error={phoneError}
          errorMessage="휴대폰 번호를 정확히 입력해 주세요."
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
        />

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
