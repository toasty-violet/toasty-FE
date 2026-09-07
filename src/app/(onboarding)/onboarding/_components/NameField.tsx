"use client";

import { Input } from "@/components/inputs/Input";

import { NAME_PATTERN } from "../_lib/validation";

type NameFieldProps = {
  value: string;
  onChange: (value: string) => void;
  title: string;
};

//구매자·셀러 온보딩이 함께 쓰는 실명 입력 필드
export function NameField({ value, onChange, title }: NameFieldProps) {
  return (
    <Input
      value={value}
      onChange={onChange}
      title={title}
      placeholder="성함을 입력해 주세요."
      maxLetter={20}
      // 입력을 시작하기 전까지는 에러를 띄우지 않는다.
      error={value !== "" && !NAME_PATTERN.test(value)}
      errorMessage="한글 또는 영문 2~20자로 입력해 주세요."
      autoComplete="name"
    />
  );
}
