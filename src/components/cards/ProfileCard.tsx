"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/buttons/Button";
import { fetchCustomerProfile } from "@/lib/user";

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full items-start gap-12">
      <span className="text-b4-regular text-fg-neutral-primary w-[6rem] shrink-0">
        {label}
      </span>
      <span className="text-b4-regular text-fg-neutral-solid min-w-0 flex-1 text-right">
        {children}
      </span>
    </div>
  );
}

export function ProfileCard() {
  const router = useRouter();
  const {
    data: profile,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["customer-profile"],
    queryFn: fetchCustomerProfile,
  });

  // 값이 비어도 카드 골격은 같으므로, 로딩·실패는 카드 자리에 문구만 남긴다.
  if (isPending || isError) {
    return (
      <section className="bg-bg-layer-default rounded-12 w-full p-16">
        <p
          role={isError ? "alert" : undefined}
          className="text-b4-regular text-fg-neutral-secondary"
        >
          {isError
            ? "회원 정보를 불러오지 못했어요."
            : "회원 정보를 불러오는 중이에요."}
        </p>
      </section>
    );
  }

  const { name, nickname, phoneNumber, address } = profile;

  return (
    <div className="flex w-full flex-col gap-14">
      <h2 className="text-t3-bold text-fg-neutral-solid">{nickname}</h2>

      <section className="bg-bg-layer-default rounded-12 flex w-full flex-col gap-16 p-16">
        <div className="flex w-full flex-col gap-12">
          <InfoRow label="이름">{name}</InfoRow>
          <InfoRow label="닉네임">{nickname}</InfoRow>
          <InfoRow label="연락처">{phoneNumber}</InfoRow>
          <InfoRow label="배송지">
            {/* 우편번호와 주소는 한 줄, 상세 주소는 아랫줄 */}
            <span className="block">
              [{address.postalCode}] {address.address}
            </span>
            <span className="block">{address.detailAddress}</span>
          </InfoRow>
        </div>

        <Button
          label="내 정보 수정"
          color="assistive"
          size="sm"
          fullWidth
          onClick={() => router.push("/me/edit")}
        />
      </section>
    </div>
  );
}
