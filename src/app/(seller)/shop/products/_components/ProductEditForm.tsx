"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import CloseIcon from "@/assets/Close.svg";
import {
  issueProductImageUploadUrls,
  uploadProductImage,
} from "@/lib/product-image";
import { BottomButton } from "@/components/buttons/BottomButton";
import { Input } from "@/components/inputs/Input";
import { Textarea } from "@/components/inputs/Textarea";
import type { SellerProductDetail, SellerProductImage } from "@/types/product";

import { updateSellerProduct } from "../_lib/product-api";
import { describeUpdateError } from "../_lib/product-error";

const MAX_IMAGES = 5;

/**
 * 사진은 고치고 난 뒤의 전체를 순서대로 보낸다. 그대로 두는 사진은 받은 키를,
 * 새로 고른 사진은 올린 뒤 받은 키를 넣는다. 목록에서 빠진 사진은 서버가 지운다.
 */
export function ProductEditForm({ product }: { product: SellerProductDetail }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(String(product.price));
  const [stock, setStock] = useState(String(product.stockQuantity));
  const [description, setDescription] = useState(product.description ?? "");
  const [images, setImages] = useState<SellerProductImage[]>(product.images);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () =>
      updateSellerProduct(product.productId, {
        name: name.trim(),
        price: Number(price),
        stockQuantity: Number(stock),
        description: description.trim(),
        imageObjectKeys: images.map((image) => image.objectKey),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      router.replace("/shop/products");
    },
  });

  async function addImages(files: FileList) {
    const room = MAX_IMAGES - images.length;
    const picked = Array.from(files).slice(0, room);
    if (picked.length === 0) return;

    setUploading(true);
    setUploadError(null);
    try {
      const uploads = await issueProductImageUploadUrls(
        picked.map((file) => ({
          contentType: file.type,
          contentLength: file.size,
        })),
      );
      await Promise.all(
        uploads.map((upload, index) =>
          uploadProductImage(upload.uploadUrl, picked[index]),
        ),
      );
      setImages((prev) => [
        ...prev,
        // 아직 올리기만 한 사진이라 주소가 없다. 미리보기는 고른 파일로 그린다.
        ...uploads.map((upload, index) => ({
          objectKey: upload.objectKey,
          imageUrl: URL.createObjectURL(picked[index]),
        })),
      ]);
    } catch {
      // 올리다 끊기면 고른 사진이 목록에 들어가지 않는다. 그냥 넘기면 아무 일도
      // 없던 것처럼 보여서 알린다.
      setUploadError("사진을 올리지 못했어요. 다시 골라 주세요.");
    } finally {
      setUploading(false);
    }
  }

  const priceValue = Number(price);
  const stockValue = Number(stock);
  const canSubmit =
    name.trim() !== "" &&
    Number.isInteger(priceValue) &&
    priceValue >= 0 &&
    Number.isInteger(stockValue) &&
    stockValue >= 1 &&
    images.length > 0 &&
    !uploading &&
    !save.isPending;

  return (
    <>
      <div className="flex flex-1 flex-col gap-28 overflow-y-auto px-20 pt-20 pb-56">
        <section className="flex w-full flex-col gap-12">
          <h2 className="text-st1-bold text-fg-neutral-solid">
            상품 사진 ({images.length}/{MAX_IMAGES})
          </h2>

          <div className="scrollbar-hidden flex w-full gap-8 overflow-x-auto">
            {images.map((image) => (
              <span
                key={image.objectKey}
                className="rounded-8 relative size-[8rem] shrink-0 overflow-hidden"
              >
                <Image
                  src={image.imageUrl}
                  alt=""
                  fill
                  sizes="80px"
                  unoptimized
                  className="object-cover"
                />
                <button
                  type="button"
                  aria-label="사진 빼기"
                  onClick={() =>
                    setImages((prev) =>
                      prev.filter((item) => item.objectKey !== image.objectKey),
                    )
                  }
                  className="bg-bg-overlay text-fg-neutral-inverted absolute top-4 right-4 flex size-20 items-center justify-center rounded-full"
                >
                  <CloseIcon className="size-12 [&_path]:fill-current" />
                </button>
              </span>
            ))}

            {images.length < MAX_IMAGES && (
              <label className="bg-bg-neutral-weak text-l5-medium text-fg-neutral-secondary rounded-8 flex size-[8rem] shrink-0 cursor-pointer items-center justify-center">
                {uploading ? "올리는 중…" : "사진 추가"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    if (event.target.files) addImages(event.target.files);
                    event.target.value = "";
                  }}
                />
              </label>
            )}
          </div>
        </section>

        <Input
          value={name}
          onChange={setName}
          title="상품명"
          placeholder="상품명을 입력해 주세요."
          maxLetter={200}
        />

        <Input
          value={price}
          onChange={setPrice}
          title="가격(원)"
          placeholder="가격을 입력해 주세요."
          inputMode="numeric"
        />

        <Input
          value={stock}
          onChange={setStock}
          title="재고 수량"
          placeholder="재고 수량을 입력해 주세요."
          inputMode="numeric"
          message="1개 이상"
        />

        <Textarea
          value={description}
          onChange={setDescription}
          title="상세 설명"
          placeholder="상품을 소개해 주세요."
          maxLetter={2000}
          autoResize
        />

        {uploadError && (
          <p role="alert" className="text-c1-medium text-fg-critical">
            {uploadError}
          </p>
        )}

        {save.isError && (
          <p role="alert" className="text-c1-medium text-fg-critical">
            {describeUpdateError(save.error)}
          </p>
        )}
      </div>

      <BottomButton
        label={save.isPending ? "저장 중…" : "저장하기"}
        onClick={() => save.mutate()}
        disabled={!canSubmit}
      />
    </>
  );
}
