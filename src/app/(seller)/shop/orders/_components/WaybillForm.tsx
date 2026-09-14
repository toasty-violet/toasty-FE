"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import DownIcon from "@/assets/Down.svg";
import { Button } from "@/components/buttons/Button";

import { describeShipmentError } from "../_lib/order-error";
import { getCouriers, registerShipment } from "../_lib/seller-order-api";

const TRACKING_NUMBER = /^\d{10,20}$/;

/** 배송대기 주문에 택배사와 운송장 번호를 넣는다. 목록 카드와 주문 상세가 같이 쓴다. */
export function WaybillForm({ orderId }: { orderId: number }) {
  const queryClient = useQueryClient();
  const { data: couriers = [] } = useQuery({
    queryKey: ["couriers"],
    queryFn: getCouriers,
    // 서버 상수라 화면을 여는 동안 바뀌지 않는다.
    staleTime: Infinity,
  });

  const [courier, setCourier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  const register = useMutation({
    mutationFn: () => registerShipment(orderId, { courier, trackingNumber }),
    // 이미 발송완료였어도(409) 다시 받아 발송완료 모습으로 바꾼다. 칩 건수도 같이 바뀐다.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
      queryClient.invalidateQueries({ queryKey: ["seller-order", orderId] });
    },
  });

  const canSubmit =
    courier !== "" &&
    TRACKING_NUMBER.test(trackingNumber) &&
    !register.isPending;

  return (
    <form
      className="flex w-full flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        if (canSubmit) register.mutate();
      }}
    >
      <div className="flex w-full items-start gap-6">
        {/* 택배사 이름이 잘리지 않게 가장 긴 이름에 맞춰 넓어진다. */}
        <label className="relative min-w-[10rem] shrink-0">
          <span className="sr-only">택배사</span>
          <select
            value={courier}
            onChange={(event) => setCourier(event.target.value)}
            className={`border-stroke-neutral-weak bg-bg-layer-default rounded-8 text-l4-regular focus:border-stroke-neutral-solid h-36 w-full appearance-none border pr-28 pl-12 outline-none ${
              courier === ""
                ? "text-fg-neutral-secondary"
                : "text-fg-neutral-solid"
            }`}
          >
            <option value="" disabled>
              택배사
            </option>
            {couriers.map((item) => (
              <option key={item.code} value={item.code}>
                {item.name}
              </option>
            ))}
          </select>
          <DownIcon className="pointer-events-none absolute top-1/2 right-8 size-16 -translate-y-1/2" />
        </label>

        <input
          value={trackingNumber}
          // 복사해 온 번호에 하이픈·공백이 섞여도 숫자만 남긴다.
          onChange={(event) =>
            setTrackingNumber(
              event.target.value.replace(/\D/g, "").slice(0, 20),
            )
          }
          inputMode="numeric"
          placeholder="운송장 번호 입력"
          aria-label="운송장 번호"
          className="border-stroke-neutral-weak bg-bg-layer-default rounded-8 text-l4-regular text-fg-neutral-solid placeholder:text-fg-neutral-placeholder focus:border-stroke-neutral-solid h-36 min-w-0 flex-1 border px-12 outline-none"
        />

        <div className="shrink-0">
          <Button
            type="submit"
            label="등록"
            color="assistive"
            size="sm"
            disabled={!canSubmit}
          />
        </div>
      </div>

      {register.isError && (
        <p role="alert" className="text-c2-medium text-fg-critical">
          {describeShipmentError(register.error)}
        </p>
      )}
    </form>
  );
}
