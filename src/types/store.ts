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
