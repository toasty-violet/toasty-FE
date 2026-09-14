"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/buttons/Button";
import { formatAddress, type DraftAddress } from "@/lib/address";

import { Input } from "./Input";

// 카카오 SDK 주소
const POSTCODE_SDK_SRC =
  "https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

//카카오로부터 받아오는 주소 데이터 타입
type PostcodeData = {
  zonecode: string; //우편 번호 5자리
  roadAddress: string; //도로명 주소
  jibunAddress: string; //지번 주소
  userSelectedType: "R" | "J"; //도로명 | 지번
  bname: string; //법정동/법정리 이름
  buildingName: string; //빌딩 이름
  apartment: "Y" | "N"; //아파트 여부
};

// toasty 백엔드에 넘길 주소 타입
export type PostalValue = DraftAddress;

type PostalInputProps = {
  value: PostalValue;
  onChange: (value: PostalValue) => void;
  title?: string;
  disabled?: boolean;
};

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: {
        oncomplete: (data: PostcodeData) => void;
        onresize?: (size: { height: number }) => void;
        width?: string;
        height?: string;
      }) => { embed: (element: HTMLElement) => void };
    };
  }
}

/* 카카오 우편번호 SDK를 한 번만 주입하고, 로드 완료를 기다린다. */
function loadPostcodeSdk() {
  if (window.daum?.Postcode) return Promise.resolve();

  const existing = document.querySelector<HTMLScriptElement>(
    `script[src="${POSTCODE_SDK_SRC}"]`,
  );

  const script = existing ?? document.createElement("script");
  if (!existing) {
    script.src = POSTCODE_SDK_SRC;
    document.body.appendChild(script);
  }

  return new Promise<void>((resolve, reject) => {
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(), { once: true });
  });
}

export function PostalInput({
  value,
  onChange,
  title = "배송지",
  disabled = false,
}: PostalInputProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  // embed는 open이 바뀔 때 한 번만 실행되므로, 최신 value/onChange를 ref로 전달한다.
  const completeRef = useRef<(data: PostcodeData) => void>(undefined);
  useEffect(() => {
    completeRef.current = (data) => {
      onChange({
        // 상세 주소는 이용자가 직접 입력하므로 재검색해도 유지한다.
        detailAddress: value.detailAddress,
        postalCode: data.zonecode,
        roadAddress: data.roadAddress,
        jibunAddress: data.jibunAddress,
        addressType: data.userSelectedType,
        // 법정리는 제외해야 하므로 "동/로/가"로 끝나는 법정동만 넘긴다.
        legalDong: /[동로가]$/.test(data.bname) ? data.bname : "",
        // 공동주택일 때만 유효한 건물명으로 취급한다.
        buildingName: data.apartment === "Y" ? data.buildingName : "",
      });
      setOpen(false);
      detailRef.current?.querySelector("input")?.focus();
    };
  });

  // embed 대상 div는 open일 때만 렌더되므로, 렌더 이후에 우편번호 화면을 붙인다.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!open || !wrap || !window.daum) return;

    new window.daum.Postcode({
      oncomplete: (data) => completeRef.current?.(data),
      onresize: (size) => {
        wrap.style.height = `${size.height}px`;
      },
      width: "100%",
      height: "100%",
    }).embed(wrap);

    // 닫을 때 SDK가 만든 iframe을 걷어내 다음 열기에서 중복되지 않게 한다.
    return () => wrap.replaceChildren();
  }, [open]);

  const handleSearch = async () => {
    await loadPostcodeSdk();
    setOpen(true);
  };

  return (
    <div className="flex w-full flex-col gap-8">
      {title && (
        <span className="text-l4-medium text-fg-neutral-strong">{title}</span>
      )}

      <div className="flex items-start gap-8">
        <div className="min-w-0 flex-1">
          <Input
            value={value.postalCode}
            onChange={() => {}}
            placeholder="우편번호"
            disabled
          />
        </div>
        <div className="shrink-0">
          <Button
            label="우편번호 찾기"
            variant="outlined"
            color="assistive"
            size="lg"
            disabled={disabled}
            onClick={handleSearch}
          />
        </div>
      </div>

      {open && (
        <div className="rounded-12 border-stroke-neutral-weak relative h-[30rem] w-full overflow-hidden border">
          <div ref={wrapRef} className="size-full" />
        </div>
      )}

      <Input
        value={formatAddress(value)}
        onChange={() => {}}
        placeholder="주소"
        disabled
      />

      <div ref={detailRef}>
        <Input
          value={value.detailAddress}
          onChange={(detailAddress) => onChange({ ...value, detailAddress })}
          placeholder="상세 주소"
          disabled={disabled}
          blurOnSubmit
        />
      </div>
    </div>
  );
}
