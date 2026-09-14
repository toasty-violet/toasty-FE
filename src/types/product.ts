/** LIVE 는 라이브 예정, GENERAL 은 판매중. 다 팔린 상품은 목록에 뜨지 않는다. */
export type SalesType = "LIVE" | "GENERAL";

/** 상태 칩. 전체 칩도 다 팔린 상품은 걸러 낸다. */
export type SellerProductFilter = "ALL" | "ON_SALE" | "SCHEDULED";

export interface SellerProduct {
  productId: number;
  name: string;
  price: number;
  stockQuantity: number;
  salesType: SalesType;
  imageUrl: string;
}

export interface SellerProductCounts {
  all: number;
  onSale: number;
  scheduled: number;
}

export interface SellerProductsPage {
  /** 첫 요청에만 온다. 이어 받을 때는 null 이다. */
  counts: SellerProductCounts | null;
  items: SellerProduct[];
  /** 이어 받을 때 그대로 넘긴다. 더 없으면 null. */
  nextCursor: number | null;
  hasNext: boolean;
}

/** 수정 요청에 그대로 돌려보낼 objectKey 와, 화면에 그릴 주소. */
export interface SellerProductImage {
  objectKey: string;
  imageUrl: string;
}

export interface SellerProductDetail {
  productId: number;
  name: string;
  price: number;
  stockQuantity: number;
  description: string;
  salesType: SalesType;
  /** 노출 순서대로. 첫 장이 대표 사진. */
  images: SellerProductImage[];
}

export interface SellerProductUpdateRequest {
  name: string;
  price: number;
  stockQuantity: number;
  description: string;
  /** 고치고 난 뒤의 사진 전체를 순서대로. 그대로 두는 사진은 받은 키를 넣는다. */
  imageObjectKeys: string[];
}

export const PRODUCT_ERROR_CODE = {
  /** 방송 중인 라이브에 편성돼 있어 라이브 화면에서만 다룰 수 있다. */
  BROADCASTING: "PRODUCT_BROADCASTING",
  /** 지우면 그 라이브에 상품이 하나도 남지 않는다. */
  LAST_IN_LIVE: "PRODUCT_LAST_IN_LIVE",
} as const;

export interface ProductImageUploadFile {
  contentType: string;
  contentLength: number;
}

export interface ProductImageUpload {
  /** 상품 등록·수정 요청에 그대로 넣는다. */
  objectKey: string;
  /** 이 주소로 사진 본문만 PUT 한다. */
  uploadUrl: string;
  expiresIn: number;
}
