import { apiClient } from "@/lib/api-client";
import type { ApiSuccess } from "@/types/api";
import type { BestProduct } from "@/types/product";

/** 인증이 없어도 부를 수 있다. 조회수가 높은 순으로 최대 10개가 온다. */
export async function getBestProducts(): Promise<BestProduct[]> {
  const { data } =
    await apiClient.get<ApiSuccess<BestProduct[]>>("/products/best");
  return data.data;
}
