"use client";

import { useEffect, useState } from "react";

import { BottomButton } from "@/components/buttons/BottomButton";
import { Input } from "@/components/inputs/Input";
import { NameField } from "@/components/inputs/NameField";
import { PhoneField } from "@/components/inputs/PhoneField";
import { PostalInput, type PostalValue } from "@/components/inputs/PostalInput";
import { useNicknameCheck } from "@/hooks/use-nickname-check";
import { isCompleteAddress } from "@/lib/address";
import { fetchSuggestedNickname } from "@/lib/user";
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
  /** 이미 채워둘 값이 있으면 넘긴다. 없으면 빈 폼으로 시작한다. */
  initialValues?: CustomerProfile;
  /**
   * initialValues 의 닉네임이 이미 등록을 마친 제 닉네임인지.
   *
   * 마이페이지 수정은 그대로 두면 중복 조회 없이 통과시켜야 하지만,
   * 아직 등록 전인 온보딩 초안은 되살렸더라도 조회를 거쳐야 한다.
   */
  nicknameRegistered?: boolean;
  /**
   * 닉네임이 비어 있을 때 서버의 추천 닉네임을 채워 둘지.
   * 아직 닉네임이 없는 온보딩만 켠다. 마이페이지 수정은 제 닉네임을 띄우므로 끈다.
   */
  suggestNickname?: boolean;
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
  nicknameRegistered = false,
  suggestNickname = false,
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
  // 아직 등록 전인 초안을 되살린 경우는 채워둔 값도 그대로 조회한다.
  const { verified: nicknameVerified, ...nicknameState } = useNicknameCheck(
    nickname,
    "nickname",
    initialValues !== undefined && !nicknameRegistered,
  );

  // 빈 입력창에 채워 둘 예시 닉네임을 받아 온다. 초안에서 되살린 닉네임이 있으면 그쪽이 우선이다.
  // 두 값 모두 화면이 사는 동안 바뀌지 않아 사실상 마운트 때 한 번만 받는다.
  // 응답이 오는 사이 사용자가 적은 값이 있으면 그쪽을 남긴다.
  // 없어도 그만인 값이라 실패하면 빈 입력창으로 둔다.
  const initialNickname = initialValues?.nickname ?? "";
  useEffect(() => {
    if (!suggestNickname || initialNickname !== "") return;

    fetchSuggestedNickname()
      .then((suggested) =>
        setNickname((prev) => (prev === "" ? suggested : prev)),
      )
      .catch(() => {});
  }, [suggestNickname, initialNickname]);

  // 원래 제 닉네임을 그대로 두는 경우는 중복 조회 없이 통과시킨다.
  const nicknameKept =
    nicknameRegistered &&
    initialValues !== undefined &&
    nickname === initialValues.nickname;

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
