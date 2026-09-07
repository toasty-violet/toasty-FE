"use client";

import { useState } from "react";

import { BottomButton } from "@/components/buttons/BottomButton";
import { Input } from "@/components/inputs/Input";
import { PostalInput, type PostalValue } from "@/components/inputs/PostalInput";

import {
  NAME_PATTERN,
  NICKNAME_PATTERN,
  PHONE_PATTERN,
} from "../_lib/validation";
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
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [postal, setPostal] = useState<PostalValue>(EMPTY_POSTAL);

  // 입력을 시작하기 전까지는 에러를 띄우지 않는다.
  const nicknameError = nickname !== "" && !NICKNAME_PATTERN.test(nickname);

  // 우편번호 검색을 마쳐야 배송지가 확정된다.
  const canSubmit =
    NAME_PATTERN.test(name) &&
    NICKNAME_PATTERN.test(nickname) &&
    PHONE_PATTERN.test(phone) &&
    postal.postalCode !== "" &&
    postal.addressType !== "";

  return (
    <>
      <div className="flex flex-1 flex-col gap-28 px-20 pb-56">
        <NameField value={name} onChange={setName} title="이름" />

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

        <PhoneField value={phone} onChange={setPhone} title="연락처" />

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
