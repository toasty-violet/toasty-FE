"use client";

import { PHONE_PATTERN, onlyDigits } from "@/lib/validation";

import { Input } from "./Input";

type PhoneFieldProps = {
  value: string;
  /** 숫자만 남긴 값이 전달된다. */
  onChange: (value: string) => void;
  title: string;
};

//구매자·셀러 온보딩이 함께 쓰는 휴대폰 번호 입력 필드
export function PhoneField({ value, onChange, title }: PhoneFieldProps) {
  return (
    <Input
      value={value}
      onChange={(next) => onChange(onlyDigits(next))}
      title={title}
      placeholder="휴대폰 번호를 입력해 주세요."
      // 입력을 시작하기 전까지는 에러를 띄우지 않는다.
      error={value !== "" && !PHONE_PATTERN.test(value)}
      errorMessage="휴대폰 번호를 정확히 입력해 주세요."
      type="tel"
      inputMode="numeric"
      autoComplete="tel"
    />
  );
}
