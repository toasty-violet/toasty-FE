"use client";

import { useState } from "react";

import DownIcon from "@/assets/Down.svg";
import { Input } from "@/components/inputs/Input";
import { BottomSheet } from "@/components/overlays/BottomSheet";

import { BANKS, bankLabelOf } from "../_lib/banks";

type BankSelectFieldProps = {
  bank: string; // 은행 코드. 비어 있으면 아직 고르지 않은 상태
  onBankChange: (bank: string) => void;
  accountNumber: string;
  onAccountNumberChange: (value: string) => void;
};

//은행 선택 버튼과 계좌 번호 입력을 하나의 "계좌번호" 항목으로 묶는 컴포넌트
export function BankSelectField({
  bank,
  onBankChange,
  accountNumber,
  onAccountNumberChange,
}: BankSelectFieldProps) {
  // 은행을 선택하는 바텀시트를 열어 뒀는지 확인하는 state
  const [sheetOpen, setSheetOpen] = useState(false);
  const selectedLabel = bankLabelOf(bank);

  const handleSelect = (code: string) => {
    onBankChange(code);
    setSheetOpen(false);
  };

  return (
    <div className="flex w-full flex-col gap-8">
      <span className="text-l4-medium text-fg-neutral-strong">계좌번호</span>

      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={sheetOpen}
        className="rounded-12 border-stroke-neutral-weak bg-bg-layer-default active:bg-bg-layer-default-pressed flex h-56 w-full items-center gap-8 border px-16 transition-colors"
      >
        <span
          className={`text-b1-regular flex-1 text-left ${
            selectedLabel === ""
              ? "text-fg-neutral-placeholder"
              : "text-fg-neutral-solid"
          }`}
        >
          {selectedLabel === "" ? "은행을 선택해주세요" : selectedLabel}
        </span>
        <DownIcon className="size-24 shrink-0" />
      </button>

      <Input
        value={accountNumber}
        onChange={onAccountNumberChange}
        placeholder="계좌 번호를 입력해 주세요."
        inputMode="numeric"
      />

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="은행 선택"
      >
        <div className="grid w-full grid-cols-3 gap-10">
          {BANKS.map(({ code, label }) => (
            <button
              key={code}
              type="button"
              onClick={() => handleSelect(code)}
              aria-pressed={bank === code}
              className={`rounded-12 active:bg-bg-layer-default-pressed flex h-56 items-center justify-center px-4 transition-colors ${
                bank === code
                  ? "border-stroke-neutral-solid text-fg-neutral-solid border-[0.15rem]"
                  : "border-stroke-neutral-weak text-fg-neutral-primary border"
              }`}
            >
              {/*
                3열에 "iM뱅크(대구)" 같은 긴 이름까지 한 줄로 담아야 해서,
                넘치는 이름만 한 단계 작은 글자로 떨어뜨린다.
              */}
              <span
                className={`text-center whitespace-nowrap ${
                  label.length > 6 ? "text-l2-semibold" : "text-l1-semibold"
                }`}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}
