"use client";

import { useState } from "react";

import { Button } from "@/components/buttons/Button";
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

//구매자가 배송지를 입력하는 온보딩 컴포넌트
export function CustomerOnboardingForm() {
  const [postal, setPostal] = useState<PostalValue>(EMPTY_POSTAL);

  // 우편번호 검색을 마쳐야 배송지가 확정된다.
  const canSubmit = postal.postalCode !== "" && postal.addressType !== "";

  return (
    <>
      <div className="flex flex-1 flex-col px-20 pt-28">
        <PostalInput value={postal} onChange={setPostal} />
      </div>

      {/* Button은 자체 너비를 갖지 않아 하단 고정 버튼은 래퍼로 늘린다. */}
      <div className="px-20 pt-10 pb-20 [&>button]:w-full">
        <Button
          label="완료"
          size="lg"
          disabled={!canSubmit}
          onClick={() => {
            // TODO: 배송지 등록 API 연동
          }}
        />
      </div>
    </>
  );
}
