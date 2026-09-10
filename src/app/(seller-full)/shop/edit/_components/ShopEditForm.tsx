"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { BottomButton } from "@/components/buttons/BottomButton";
import { ShopImageField } from "@/components/forms/ShopImageField";
import { Input } from "@/components/inputs/Input";
import { Textarea } from "@/components/inputs/Textarea";
import { useNicknameCheck } from "@/hooks/use-nickname-check";
import { objectKeyFromUrl } from "@/lib/upload";
import { updateSellerShop } from "@/lib/user";
import type { SellerShop } from "@/types/user";

import { ShippingFeeField } from "./ShippingFeeField";

//이미 등록한 스토어 사진·이름·소개·배송비를 고치는 화면
export function ShopEditForm({ shop }: { shop: SellerShop }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [shopName, setShopName] = useState(shop.shopName);
  const [description, setDescription] = useState(shop.description);
  // 수정 API 는 사진을 그대로 둘 때도 objectKey 를 요구한다. 빼고 보내면 사진이
  // 지워지므로, 새로 고르기 전까지는 지금 사진의 키를 들고 있는다.
  const [shopImageObjectKey, setShopImageObjectKey] = useState(() =>
    objectKeyFromUrl(shop.shopImageUrl),
  );
  // 입력 중에는 칸을 비울 수 있어야 하므로 null 을 허용한다.
  const [shippingFee, setShippingFee] = useState<
    Record<keyof SellerShop["shippingFee"], number | null>
  >(shop.shippingFee);

  // 지금 쓰고 있는 이름이 채워진 채 열리므로, 이용자가 고친 뒤부터 중복을 묻는다.
  const { verified: shopNameVerified, ...shopNameCheck } = useNicknameCheck(
    shopName,
    "shopName",
  );

  const mutation = useMutation({
    mutationFn: updateSellerShop,
    onSuccess: () => {
      // 스토어 홈이 방금 고친 값을 보여주도록 조회를 무효화한다.
      queryClient.invalidateQueries({ queryKey: ["seller-shop"] });
      router.replace("/shop");
    },
  });

  const handleSubmit = () => {
    mutation.mutate({
      shopName,
      description,
      shopImageObjectKey,
      // 비워 둔 칸은 0 원으로 본다.
      baseShippingFee: shippingFee.baseShippingFee ?? 0,
      freeShippingThreshold: shippingFee.freeShippingThreshold ?? 0,
      remoteAreaShippingFee: shippingFee.remoteAreaShippingFee ?? 0,
    });
  };

  // 이름을 고쳤다면 중복 조회까지 통과해야 한다. 그대로 두었다면 다시 물을 필요가 없다.
  const shopNameReady =
    shopName === shop.shopName || (shopNameVerified && !shopNameCheck.error);
  // 사진은 온보딩과 같이 필수다. 키가 비면 서버가 사진을 지우므로 저장을 막는다.
  const canSubmit =
    shopNameReady &&
    description.trim() !== "" &&
    shopImageObjectKey !== "" &&
    !mutation.isPending;

  return (
    <>
      <div className="flex flex-1 flex-col gap-28 overflow-y-auto px-20 pt-20 pb-56">
        <ShopImageField
          onChange={setShopImageObjectKey}
          initialImageUrl={shop.shopImageUrl}
        />

        <Input
          value={shopName}
          onChange={setShopName}
          title="스토어 이름"
          placeholder="스토어 이름을 입력해 주세요."
          message="2~20자 이내"
          maxLetter={20}
          {...shopNameCheck}
        />

        <Textarea
          value={description}
          onChange={setDescription}
          title="스토어 소개"
          placeholder="스토어 소개를 작성해 주세요."
          maxLetter={200}
          autoResize
        />

        <section className="flex w-full flex-col gap-14">
          <h2 className="text-st1-bold text-fg-neutral-solid">배송비 설정</h2>

          <div className="flex w-full flex-col gap-28">
            <ShippingFeeField
              title="기본 배송비(원)"
              value={shippingFee.baseShippingFee}
              onChange={(baseShippingFee) =>
                setShippingFee((prev) => ({ ...prev, baseShippingFee }))
              }
            />
            <ShippingFeeField
              title="무료배송 기준 금액(원)"
              value={shippingFee.freeShippingThreshold}
              onChange={(freeShippingThreshold) =>
                setShippingFee((prev) => ({ ...prev, freeShippingThreshold }))
              }
            />
            <ShippingFeeField
              title="도서산간 배송비(원)"
              value={shippingFee.remoteAreaShippingFee}
              onChange={(remoteAreaShippingFee) =>
                setShippingFee((prev) => ({ ...prev, remoteAreaShippingFee }))
              }
            />
          </div>
        </section>

        {mutation.isError && (
          <p role="alert" className="text-c1-medium text-fg-critical">
            스토어 정보를 저장하지 못했어요. 다시 시도해 주세요.
          </p>
        )}
      </div>

      <BottomButton
        label={mutation.isPending ? "저장 중…" : "저장하기"}
        onClick={handleSubmit}
        disabled={!canSubmit}
      />
    </>
  );
}
