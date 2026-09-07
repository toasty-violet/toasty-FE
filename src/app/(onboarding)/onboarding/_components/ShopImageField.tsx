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

//스토어 사진을 골라 S3 에 올리고, 제출에 쓸 objectKey 를 상위로 넘기는 컴포넌트
export function ShopImageField({ onChange }: ShopImageFieldProps) {
  // 서버에는 objectKey 만 오가므로, 화면에 띄울 그림은 고른 파일에서 직접 만든다.
  const [previewUrl, setPreviewUrl] = useState("");

  const upload = useMutation({
    mutationFn: uploadShopImage,
    onSuccess: onChange,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
    upload.mutate(file);
  };

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
          accept="image/*"
          disabled={upload.isPending}
          onChange={handleChange}
          className="sr-only"
        />
        <span className="sr-only">스토어 사진 업로드</span>
      </label>

      {upload.isError && (
        <p className="text-c1-medium text-fg-critical">
          사진을 올리지 못했어요. 다시 시도해 주세요.
        </p>
      )}
    </div>
  );
}
