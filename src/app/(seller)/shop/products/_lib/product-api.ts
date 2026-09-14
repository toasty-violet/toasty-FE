import { apiClient } from "@/lib/api-client";
import type { ApiSuccess } from "@/types/api";
import type {
  SellerProductDetail,
  SellerProductFilter,
  SellerProductUpdateRequest,
  SellerProductsPage,
} from "@/types/product";

/**
 * 상품탭 한 묶음. 첫 요청은 cursor 없이 부르고, 목록 끝에 닿으면 직전 응답의
 * nextCursor 를 그대로 넘긴다. 검색 화면도 keyword 를 실어 같은 곳을 부른다.
 */
export async function getSellerProducts(params: {
  status: SellerProductFilter;
  cursor?: number | null;
  keyword?: string;
}): Promise<SellerProductsPage> {
  const { data } = await apiClient.get<ApiSuccess<SellerProductsPage>>(
    "/seller/products",
    {
      params: {
        status: params.status,
        cursor: params.cursor ?? undefined,
        keyword: params.keyword || undefined,
      },
    },
  );
  return data.data;
}

/** 수정 화면을 채운다. 사진마다 되돌려 보낼 objectKey 가 함께 온다. */
export async function getSellerProduct(
  productId: number,
): Promise<SellerProductDetail> {
  const { data } = await apiClient.get<ApiSuccess<SellerProductDetail>>(
    `/seller/products/${productId}`,
  );
  return data.data;
}

export async function updateSellerProduct(
  productId: number,
  body: SellerProductUpdateRequest,
) {
  await apiClient.patch(`/seller/products/${productId}`, body);
}

/** 편성돼 있던 라이브에서도 함께 빠진다. */
export async function deleteSellerProduct(productId: number) {
  await apiClient.delete(`/seller/products/${productId}`);
}
