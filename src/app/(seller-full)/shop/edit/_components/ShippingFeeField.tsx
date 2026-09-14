"use client";

import { Input } from "@/components/inputs/Input";
import { formatThousand } from "@/lib/format";

type ShippingFeeFieldProps = {
  title: string;
  /** 비어 있으면 null. 0 도 유효한 금액이라 빈 값과 갈라 둔다. */
  value: number | null;
  onChange: (value: number | null) => void;
};

// 금액이라 정수만 받는다. 백만 원을 넘는 배송비는 오타로 본다.
const MAX_FEE = 1_000_000;

/** 배송비 한 칸. 화면에는 1,000 단위 쉼표로 보이고 상위에는 숫자로 넘긴다. */
export function ShippingFeeField({
  title,
  value,
  onChange,
}: ShippingFeeFieldProps) {
  const handleChange = (text: string) => {
    // 쉼표는 우리가 붙인 것이라 지우고, 숫자만 남긴다.
    const digits = text.replace(/[^0-9]/g, "");
    if (digits === "") {
      onChange(null);
      return;
    }

    onChange(Math.min(Number(digits), MAX_FEE));
  };

  return (
    <Input
      value={value === null ? "" : formatThousand(value)}
      onChange={handleChange}
      title={title}
      placeholder="0"
      // 모바일에서 숫자 키패드를 띄운다. type="number" 는 쉼표를 넣을 수 없어 쓰지 않는다.
      inputMode="numeric"
      clearable={false}
    />
  );
}
