import {
  issueProductImageUploadUrls,
  uploadProductImage,
} from "@/app/live/_lib/live-api";
import type { LiveProductInput } from "@/types/live";
import type { DraftProduct } from "./draft-product";

/**
 * 아직 안 올린 사진만 S3 에 올리고, 받은 objectKey 를 붙인 목록을 돌려준다.
 * 저장이 실패해 다시 시도할 때 같은 사진을 또 올리지 않게 하려는 것이다.
 */
export async function uploadDraftProducts(
  products: DraftProduct[],
): Promise<DraftProduct[]> {
  const pending = products.filter((product) => !product.imageObjectKey);
  if (pending.length === 0) {
    return products;
  }

  const uploads = await issueProductImageUploadUrls(
    pending.map(({ file }) => ({
      contentType: file.type,
      contentLength: file.size,
    })),
  );

  await Promise.all(
    uploads.map((upload, index) =>
      uploadProductImage(upload.uploadUrl, pending[index].file),
    ),
  );

  const keyById = new Map(
    pending.map((product, index) => [product.id, uploads[index].objectKey]),
  );

  return products.map((product) =>
    keyById.has(product.id)
      ? { ...product, imageObjectKey: keyById.get(product.id) }
      : product,
  );
}

export function toProductInputs(products: DraftProduct[]): LiveProductInput[] {
  return products.map((product) => ({
    name: product.name.trim(),
    price: product.price,
    stockQuantity: product.stockQuantity,
    imageObjectKey: product.imageObjectKey!,
  }));
}
