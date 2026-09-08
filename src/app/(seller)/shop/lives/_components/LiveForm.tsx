"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { Header } from "@/components/headers/Header";
import { Input } from "@/components/inputs/Input";
import { Textarea } from "@/components/inputs/Textarea";
import { Button } from "@/components/buttons/Button";
import { BottomButton } from "@/components/buttons/BottomButton";
import { createLive, updateLive } from "@/app/live/_lib/live-api";
import { describeLiveError } from "@/app/live/_lib/live-error";
import type { Live, LiveProduct, LiveWithProducts } from "@/types/live";

import { LeaveConfirmModal } from "./LeaveConfirmModal";
import { LiveScheduleField } from "./LiveScheduleField";
import { ProductSetupForm } from "./ProductSetupForm";
import {
  toProductInputs,
  toProductUpserts,
  uploadDraftProducts,
} from "./upload-draft-products";
import type { DraftProduct } from "./draft-product";

const TITLE_MAX = 20;
const DESCRIPTION_MAX = 45;

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// crypto.randomUUID 는 보안 컨텍스트에서만 동작한다. LAN 주소로 폰에서 열어
// 확인하는 경우가 있어 없을 때를 대비한다.
let sequence = 0;
const nextDraftId = () =>
  globalThis.crypto?.randomUUID?.() ?? `draft-${Date.now()}-${sequence++}`;
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_PRODUCTS = 50;

// 방송 예정 시각 기본값은 다음 날 오후 8시다.
function defaultScheduledAt() {
  const at = new Date();
  at.setDate(at.getDate() + 1);
  at.setHours(20, 0, 0, 0);
  return at;
}

/** 상품 목록이 처음과 달라졌는지만 보면 되므로 값들을 한 줄로 이어 붙여 비교한다. */
function productsSignature(products: DraftProduct[]) {
  return products
    .map((product) =>
      [
        product.productId ?? product.id,
        product.name,
        product.price,
        product.stockQuantity,
        product.imageObjectKey ?? "",
      ].join(":"),
    )
    .join("|");
}

/** 편성된 상품을 폼이 다룰 수 있는 형태로 옮긴다. 사진은 서버가 준 주소를 그대로 쓴다. */
function toDrafts(products: LiveProduct[]): DraftProduct[] {
  return products.map((product) => ({
    id: `product-${product.productId}`,
    productId: product.productId,
    previewUrl: product.imageUrl,
    name: product.name,
    price: product.price,
    stockQuantity: product.stockQuantity,
  }));
}

export type LiveFormMode =
  { type: "create" } | { type: "edit"; live: Live; products: LiveProduct[] };

export function LiveForm({
  mode,
  onSaved,
}: {
  mode: LiveFormMode;
  onSaved: (live: Live) => void;
}) {
  const editing = mode.type === "edit" ? mode : null;
  const router = useRouter();
  const [step, setStep] = useState<"info" | "products">("info");
  const [title, setTitle] = useState(editing?.live.title ?? "");
  const [description, setDescription] = useState(
    editing?.live.description ?? "",
  );
  const [initialScheduledAt] = useState(() =>
    editing ? new Date(editing.live.scheduledAt) : defaultScheduledAt(),
  );
  const [scheduledAt, setScheduledAt] = useState(initialScheduledAt);
  const [products, setProducts] = useState<DraftProduct[]>(() =>
    editing ? toDrafts(editing.products) : [],
  );
  const [initialProducts] = useState(() =>
    productsSignature(editing ? toDrafts(editing.products) : []),
  );
  const [fileError, setFileError] = useState<string | null>(null);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [askingLeave, setAskingLeave] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 만든 미리보기 주소를 모아뒀다가 화면을 떠날 때 한 번에 해제한다.
  // 이미 해제된 주소를 다시 해제해도 아무 일도 일어나지 않는다.
  const previewUrls = useRef<string[]>([]);
  useEffect(
    () => () => previewUrls.current.forEach((url) => URL.revokeObjectURL(url)),
    [],
  );

  const mutation = useMutation({
    mutationFn: async () => {
      const uploaded = await uploadDraftProducts(products);
      // 저장이 실패해도 올린 사진은 남겨, 다시 시도할 때 또 올리지 않는다.
      setProducts(uploaded);

      if (editing) {
        await updateLive(editing.live.liveId, {
          title: title.trim(),
          description: description.trim(),
          scheduledAt: toLocalIso(scheduledAt),
          products: toProductUpserts(uploaded),
        });
        return editing.live;
      }

      const created: LiveWithProducts = await createLive({
        title: title.trim(),
        description: description.trim() || undefined,
        scheduledAt: toLocalIso(scheduledAt),
        products: toProductInputs(uploaded),
      });
      return created.live;
    },
    onSuccess: onSaved,
  });

  const pickFiles = (picked: FileList | null) => {
    if (!picked?.length) return;

    // 문제 있는 파일만 걸러내고, 나머지는 그대로 담는다.
    const files = [...picked];
    const wrongType = files.filter(
      (file) => !ACCEPTED_TYPES.includes(file.type),
    );
    const tooBig = files.filter(
      (file) =>
        ACCEPTED_TYPES.includes(file.type) && file.size > MAX_FILE_BYTES,
    );
    const room = MAX_PRODUCTS - products.length;
    const usable = files
      .filter((file) => !wrongType.includes(file) && !tooBig.includes(file))
      .slice(0, Math.max(room, 0));

    const reasons = [
      wrongType.length && `${wrongType.length}장은 jpeg·png·webp가 아니라`,
      tooBig.length && `${tooBig.length}장은 10MB를 넘어서`,
      files.length - wrongType.length - tooBig.length > usable.length &&
        `상품은 ${MAX_PRODUCTS}개까지만 등록할 수 있어`,
    ].filter(Boolean);

    setFileError(reasons.length ? `${reasons.join(", ")} 제외했습니다.` : null);
    if (usable.length === 0) return;
    mutation.reset();
    setProducts([
      ...products,
      ...usable.map((file) => {
        const previewUrl = URL.createObjectURL(file);
        previewUrls.current.push(previewUrl);
        return {
          id: nextDraftId(),
          file,
          previewUrl,
          name: "",
          price: 0,
          stockQuantity: 1,
        };
      }),
    ]);
    setStep("products");
  };

  // 지난 시각은 서버가 400 으로 막는다. 누르기 전에 알려준다.
  const changeSchedule = (next: Date) => {
    setScheduledAt(next);
    setScheduleError(
      next.getTime() > Date.now()
        ? null
        : "방송 예정 시각은 현재 이후여야 합니다.",
    );
  };

  // 편집도 이 함수를 타므로 id 로 비교한다. 객체로 비교하면 이름만 바꿔도
  // 새 객체가 되어, 아직 쓰는 중인 미리보기 주소를 해제해 버린다.
  const changeProducts = (next: DraftProduct[]) => {
    const nextIds = new Set(next.map((product) => product.id));
    products
      .filter((product) => !nextIds.has(product.id))
      .forEach((product) => URL.revokeObjectURL(product.previewUrl));
    setProducts(next);
  };

  const screenTitle = editing ? "라이브 수정" : "신규 라이브";

  if (step === "products") {
    return (
      <>
        <Header title={screenTitle} onBack={() => setStep("info")} />
        <ProductSetupForm
          products={products}
          onChange={changeProducts}
          onSubmit={() => setStep("info")}
        />
      </>
    );
  }

  // 뒤로가기로 작성 중인 내용을 잃기 전에 물어본다.
  // 수정은 값이 채워진 채로 열리므로, 처음 불러온 값과 달라졌을 때만 묻는다.
  const isDirty =
    title.trim() !== (editing?.live.title ?? "") ||
    description.trim() !== (editing?.live.description ?? "") ||
    scheduledAt.getTime() !== initialScheduledAt.getTime() ||
    productsSignature(products) !== initialProducts;

  const canSubmit =
    title.trim().length > 0 &&
    products.length > 0 &&
    !scheduleError &&
    !mutation.isPending;

  return (
    <>
      <Header
        title={screenTitle}
        onBack={() => (isDirty ? setAskingLeave(true) : router.back())}
      />

      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="flex flex-col gap-28 p-20">
          <Input
            title="방송 제목"
            placeholder="방송 제목을 입력해 주세요."
            value={title}
            maxLetter={TITLE_MAX}
            onChange={(next) => {
              mutation.reset();
              setTitle(next);
            }}
          />
          <Textarea
            title="방송 설명"
            placeholder="방송 설명을 작성해 주세요."
            value={description}
            maxLetter={DESCRIPTION_MAX}
            onChange={setDescription}
          />
        </div>

        <div className="bg-bg-layer-default-pressed h-8 w-full" />

        <div className="flex flex-col gap-16 p-20">
          <div className="flex flex-col gap-4">
            <span className="text-l3-medium text-fg-neutral-solid">
              판매 상품
            </span>
            <span className="text-c2-regular text-fg-neutral-secondary">
              사진을 여러 장 선택하면, 상품 목록이 생성돼요.
            </span>
          </div>

          {products.length > 0 && (
            <ul className="-mx-20 flex gap-10 overflow-x-auto px-20">
              {products.map((product) => (
                <li
                  key={product.id}
                  className="rounded-8 size-[7.6rem] shrink-0 overflow-hidden"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.previewUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                </li>
              ))}
            </ul>
          )}

          <Button
            label={products.length > 0 ? "상품 수정" : "상품 등록"}
            color="secondary"
            size="md"
            fullWidth
            onClick={() =>
              products.length > 0
                ? setStep("products")
                : fileInputRef.current?.click()
            }
          />
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            multiple
            hidden
            onChange={(event) => {
              pickFiles(event.target.files);
              event.target.value = "";
            }}
          />

          {(fileError || mutation.error) && (
            <p role="alert" className="text-c1-medium text-fg-critical">
              {fileError ?? describeLiveError(mutation.error).message}
            </p>
          )}
        </div>

        <div className="bg-bg-layer-default-pressed h-8 w-full" />

        <LiveScheduleField
          scheduledAt={scheduledAt}
          onChange={changeSchedule}
        />
        {scheduleError && (
          <p role="alert" className="text-c1-medium text-fg-critical px-20">
            {scheduleError}
          </p>
        )}
      </div>

      <BottomButton
        label={mutation.isPending ? "저장하는 중…" : "저장하기"}
        disabled={!canSubmit}
        onClick={() => mutation.mutate()}
      />

      {askingLeave && (
        <LeaveConfirmModal
          canSave={canSubmit}
          onDiscard={() => router.back()}
          onSave={() => {
            setAskingLeave(false);
            mutation.mutate();
          }}
          onClose={() => setAskingLeave(false)}
        />
      )}
    </>
  );
}

// 서버는 LocalDateTime 을 받는다. toISOString 을 쓰면 UTC 로 밀린다.
function toLocalIso(at: Date) {
  const pad = (value: number) => `${value}`.padStart(2, "0");
  return (
    `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}` +
    `T${pad(at.getHours())}:${pad(at.getMinutes())}:00`
  );
}
