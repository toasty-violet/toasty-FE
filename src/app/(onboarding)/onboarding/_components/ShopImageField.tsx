"use client";

import { useState } from "react";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";

import { uploadShopImage } from "@/lib/upload";

import CameraIcon from "./assets/Camera.svg";
import ShopImageDefault from "./assets/ShopImageDefault.svg";

type ShopImageFieldProps = {
  onChange: (objectKey: string) => void;
};

// 서버가 presign 해주는 형식과 크기. 이 범위를 벗어난 파일은 올려도 400 이라 미리 거른다.
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024;

//스토어 사진을 골라 S3 에 올리고, 제출에 쓸 objectKey 를 상위로 넘기는 컴포넌트
export function ShopImageField({ onChange }: ShopImageFieldProps) {
  // 서버에는 objectKey 만 오가므로, 화면에 띄울 그림은 고른 파일에서 직접 만든다.
  const [previewUrl, setPreviewUrl] = useState("");
  const [validationError, setValidationError] = useState("");

  const upload = useMutation({
    mutationFn: uploadShopImage,
    onSuccess: onChange,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // 같은 파일을 다시 골라도 change 가 뜨도록 값을 비워 둔다. 실패한 사진으로 재시도할 수 있어야 한다.
    event.target.value = "";
    if (!file) return;

    // 거른 사진은 등록되지 않았으므로 미리보기를 기본 이미지로 되돌린다.
    // 앞서 올려 둔 사진이 있었다면 그 objectKey 도 함께 비워, 화면과 제출값을 맞춘다.
    const reject = (message: string) => {
      setPreviewUrl("");
      setValidationError(message);
      onChange("");
    };

    if (!ACCEPTED_TYPES.includes(file.type)) {
      reject("JPG, PNG, WEBP 형식만 올릴 수 있어요.");
      return;
    }
    if (file.size > MAX_SIZE) {
      reject("10MB 이하 사진만 올릴 수 있어요.");
      return;
    }

    setValidationError("");
    setPreviewUrl(URL.createObjectURL(file));
    upload.mutate(file);
  };

  // 고르자마자 걸러낸 파일은 업로드를 시작하지 않으므로 두 메시지가 겹치지 않는다.
  const errorMessage =
    validationError ||
    (upload.isError ? "사진을 올리지 못했어요. 다시 시도해 주세요." : "");

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <label className="relative block size-[10rem] cursor-pointer">
        <span className="border-stroke-neutral-weak relative block size-full overflow-hidden rounded-full border">
          {previewUrl === "" ? (
            <ShopImageDefault className="size-full" />
          ) : (
            <Image
              src={previewUrl}
              alt="스토어 사진"
              fill
              sizes="10rem"
              // blob URL 은 브라우저 메모리에만 있어 서버가 최적화할 수 없다.
              unoptimized
              className="object-cover"
            />
          )}
        </span>
        <CameraIcon className="absolute right-0 bottom-0 size-32" />
        <input
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          disabled={upload.isPending}
          onChange={handleChange}
          className="sr-only"
        />
        <span className="sr-only">스토어 사진 업로드</span>
      </label>

      {errorMessage && (
        <p role="alert" className="text-c1-medium text-fg-critical">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
