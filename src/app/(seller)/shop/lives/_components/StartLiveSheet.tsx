"use client";

import { useState } from "react";

import CheckBlankIcon from "@/assets/CheckBlank.svg";
import CheckFilledIcon from "@/assets/CheckFilled.svg";
import { Button } from "@/components/buttons/Button";
import { BottomSheet } from "@/components/overlays/BottomSheet";

const ITEMS = ["카메라 및 마이크 준비 완료", "상품 목록 설정 완료"];

function CheckRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  const Icon = checked ? CheckFilledIcon : CheckBlankIcon;

  return (
    <label className="text-l3-medium text-fg-neutral-solid relative flex w-full items-center gap-12 py-12">
      {/* 체크 모양은 디자인 아이콘으로 그리고, 동작은 네이티브 인풋에 맡긴다.
          인풋을 행 전체에 깔아 어디를 눌러도 켜지게 한다. */}
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
      <Icon className="size-24 shrink-0" />
      {label}
    </label>
  );
}

export function StartLiveSheet({
  open,
  title,
  onClose,
  onStart,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  onStart: () => void;
}) {
  // 확인용 체크라 기억할 필요가 없다. 시트를 닫으면 처음 상태로 돌아간다.
  const [checked, setChecked] = useState<boolean[]>(ITEMS.map(() => false));
  const allChecked = checked.every(Boolean);

  const close = () => {
    setChecked(ITEMS.map(() => false));
    onClose();
  };

  return (
    // 제목과 설명이 한 덩어리라 시트가 그리는 제목은 접근성용으로만 남긴다.
    <BottomSheet open={open} onClose={close} title={title} hideTitle>
      <div className="flex w-full flex-col items-center gap-8 text-center">
        <h3 className="text-t3-bold text-fg-neutral-solid">{title}</h3>
        <p className="text-l5-medium text-fg-neutral-secondary">
          방송 시작 전 아래 사항을 체크해주세요.
        </p>
      </div>

      <div className="flex w-full flex-col">
        {ITEMS.map((label, index) => (
          <CheckRow
            key={label}
            label={label}
            checked={checked[index]}
            onToggle={() =>
              setChecked(checked.map((on, at) => (at === index ? !on : on)))
            }
          />
        ))}
      </div>

      <div className="flex w-full gap-10">
        <div className="flex-1">
          <Button
            label="취소"
            variant="outlined"
            color="assistive"
            size="md"
            fullWidth
            onClick={close}
          />
        </div>
        <div className="flex-1">
          <Button
            label="방송 시작"
            color="secondary"
            size="md"
            fullWidth
            disabled={!allChecked}
            onClick={onStart}
          />
        </div>
      </div>
    </BottomSheet>
  );
}
