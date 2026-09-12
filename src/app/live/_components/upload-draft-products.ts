import {
  issueProductImageUploadUrls,
  uploadProductImage,
} from "@/lib/product-image";
import type { LiveProductInput, LiveProductUpsert } from "@/types/live";
import type { DraftProduct } from "./draft-product";

// 발급 API 는 한 번에 20 장까지 받는다. 상품 상한(50)보다 낮아 나눠 부른다.
const UPLOAD_URL_BATCH = 20;

function chunk<T>(items: T[], size: number) {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, (index + 1) * size),
  );
}

/**
 * 아직 안 올린 사진만 S3 에 올리고, 받은 objectKey 를 붙인 목록을 돌려준다.
 * 저장이 실패해 다시 시도할 때 같은 사진을 또 올리지 않게 하려는 것이다.
 */
export async function uploadDraftProducts(
  products: DraftProduct[],
): Promise<DraftProduct[]> {
  // 불러온 상품은 사진을 바꾸기 전까지 file 이 없어 올릴 것도 없다.
  const pending = products.filter(
    (product) => product.file && !product.imageObjectKey,
  );
  if (pending.length === 0) {
    return products;
  }

  const batches = await Promise.all(
    chunk(pending, UPLOAD_URL_BATCH).map((batch) =>
      issueProductImageUploadUrls(
        batch.map(({ file }) => ({
          contentType: file!.type,
          contentLength: file!.size,
        })),
      ),
    ),
  );
  const uploads = batches.flat();

  await Promise.all(
    uploads.map((upload, index) =>
      uploadProductImage(upload.uploadUrl, pending[index].file!),
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

/** 수정은 상품 전체를 보낸다. 사진을 바꾸지 않은 상품은 키를 빼야 그대로 유지된다. */
export function toProductUpserts(
  products: DraftProduct[],
): LiveProductUpsert[] {
  return products.map((product) => ({
    productId: product.productId,
    name: product.name.trim(),
    price: product.price,
    stockQuantity: product.stockQuantity,
    imageObjectKey: product.imageObjectKey,
  }));
}
