/** 홈 스토어 TOP3 요청의 아이템 1개 */
export interface TopStore {
  sellerId: number;
  shopName: string;
  shopImageUrl: string;
  followerCount: number;
  productCount: number;
  following: boolean;
}

/** 팔로우하는 스토어 목록의 상품 1개 */
export interface FollowedStoreProduct {
  productId: number;
  name: string;
  price: number;
  imageUrl: string;
}

/** 팔로우하는 스토어 1곳과 대표 상품들 */
export interface FollowedStore {
  sellerId: number;
  shopName: string;
  shopImageUrl: string;
  products: FollowedStoreProduct[];
}

/** 손님이 보는 스토어 상세. 비로그인이면 following 이 false 로 온다. */
export interface SellerProfile {
  sellerId: number;
  shopImageUrl: string | null;
  shopName: string;
  followerCount: number;
  productCount: number;
  description: string;
  following: boolean;
}
