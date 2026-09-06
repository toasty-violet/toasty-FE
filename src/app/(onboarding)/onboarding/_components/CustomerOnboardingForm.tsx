"use client";

import { useState } from "react";

import { BottomButton } from "@/components/buttons/BottomButton";
import { Input } from "@/components/inputs/Input";
import { PostalInput, type PostalValue } from "@/components/inputs/PostalInput";

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
const NICKNAME_PATTERN = /^[가-힣a-zA-Z0-9]{2,20}$/;
const PHONE_PATTERN = /^01[016789][0-9]{7,8}$/;

/** 하이픈을 걷어낸 숫자만 남긴다. 검증과 표시 모두 숫자 기준으로 다룬다. */
const onlyDigits = (value: string) => value.replace(/[^0-9]/g, "");

//구매자가 기본 정보(이름, 닉네임, 연락처, 배송지)를 입력하는 온보딩 컴포넌트
export function CustomerOnboardingForm() {
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [postal, setPostal] = useState<PostalValue>(EMPTY_POSTAL);

  // 입력을 시작하기 전까지는 에러를 띄우지 않는다.
  const nameError = name !== "" && !NAME_PATTERN.test(name);
  const nicknameError = nickname !== "" && !NICKNAME_PATTERN.test(nickname);
  const phoneError = phone !== "" && !PHONE_PATTERN.test(phone);

  // 우편번호 검색을 마쳐야 배송지가 확정된다.
  const canSubmit =
    NAME_PATTERN.test(name) &&
    NICKNAME_PATTERN.test(nickname) &&
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
          value={nickname}
          onChange={setNickname}
          title="닉네임"
          placeholder="닉네임을 입력해 주세요."
          message="2~20자 이내"
          maxLetter={20}
          error={nicknameError}
          errorMessage="한글, 영문, 숫자 2~20자로 입력해 주세요."
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
        label="다음"
        disabled={!canSubmit}
        onClick={() => {
          // TODO: 구매자 기본 정보 등록 API 연동
        }}
      />
    </>
  );
}
