import {
  issueProductImageUploadUrls,
  uploadProductImage,
} from "@/app/live/_lib/live-api";
import type { LiveProductInput } from "@/types/live";
import type { DraftProduct } from "./draft-product";

/** 사진을 먼저 S3 에 올리고, 받은 objectKey 를 상품에 붙여 돌려준다. */
export async function uploadDraftProducts(
  products: DraftProduct[],
): Promise<LiveProductInput[]> {
  const uploads = await issueProductImageUploadUrls(
    products.map(({ file }) => ({
      contentType: file.type,
      contentLength: file.size,
    })),
  );

  await Promise.all(
    uploads.map((upload, index) =>
      uploadProductImage(upload.uploadUrl, products[index].file),
    ),
  );

  return products.map((product, index) => ({
    name: product.name.trim(),
    price: product.price,
    stockQuantity: product.stockQuantity,
    imageObjectKey: uploads[index].objectKey,
  }));
}
