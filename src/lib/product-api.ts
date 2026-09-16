import { apiClient } from "@/lib/api-client";
import type { ApiSuccess } from "@/types/api";
import type { BestProduct, ProductDetail } from "@/types/product";

/**
 * 손님이 보는 상품 상세. 인증이 없어도 부를 수 있다.
 * 부를 때마다 조회수가 올라 베스트 아이템 순서에 반영되므로 화면당 한 번만 부른다.
 * 지금 살 수 있는 상품만 열린다. 라이브에서 팔 상품이나 다 팔린 상품은 404 다.
 */
export async function getProduct(productId: number): Promise<ProductDetail> {
  const { data } = await apiClient.get<ApiSuccess<ProductDetail>>(
    `/products/${productId}`,
  );
  return data.data;
}

/** 인증이 없어도 부를 수 있다. 조회수가 높은 순으로 최대 10개가 온다. */
export async function getBestProducts(): Promise<BestProduct[]> {
  const { data } =
    await apiClient.get<ApiSuccess<BestProduct[]>>("/products/best");
  return data.data;
}
