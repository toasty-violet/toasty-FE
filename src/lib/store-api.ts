import { apiClient } from "@/lib/api-client";
import type { ApiSuccess } from "@/types/api";
import type { StoreProductsPage } from "@/types/product";
import type { FollowedStore, SellerProfile, TopStore } from "@/types/store";

/** 인증이 없어도 부를 수 있고, 그때는 following 이 모두 false 로 온다. */
export async function getTopStores(): Promise<TopStore[]> {
  const { data } = await apiClient.get<ApiSuccess<TopStore[]>>("/stores/top");
  return data.data;
}

export async function followStore(sellerId: number) {
  await apiClient.post(`/stores/${sellerId}/follow`);
}

export async function unfollowStore(sellerId: number) {
  await apiClient.delete(`/stores/${sellerId}/follow`);
}

/**
 * 팔로우한 스토어와 대표 상품들. 최대 3곳이 내려온다.
 * 인증이 없거나 팔로우가 3곳보다 적으면 서버가 다른 스토어로 3곳을 채워 준다.
 */
export async function getFollowedStores(): Promise<FollowedStore[]> {
  const { data } = await apiClient.get<ApiSuccess<FollowedStore[]>>(
    "/customers/following",
  );
  return data.data;
}

/**
 * 스토어 화면의 상품 목록. 첫 요청은 cursor 없이 부르고,
 * 목록 끝에 닿으면 받은 nextCursor 를 그대로 넘긴다.
 */
export async function getStoreProducts(
  sellerId: number,
  cursor?: number | null,
): Promise<StoreProductsPage> {
  const { data } = await apiClient.get<ApiSuccess<StoreProductsPage>>(
    `/stores/${sellerId}/products`,
    { params: { cursor: cursor ?? undefined } },
  );
  return data.data;
}

/** 손님이 보는 스토어 상세. 인증이 없어도 부를 수 있다. */
export async function getSellerProfile(
  sellerId: number,
): Promise<SellerProfile> {
  const { data } = await apiClient.get<ApiSuccess<SellerProfile>>(
    `/sellers/${sellerId}`,
  );
  return data.data;
}
