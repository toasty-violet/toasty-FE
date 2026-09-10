/** 홈 스토어 TOP3 요청의 아이템 1개 */
export interface TopStore {
  sellerId: number;
  shopName: string;
  shopImageUrl: string;
  followerCount: number;
  productCount: number;
  following: boolean;
}
