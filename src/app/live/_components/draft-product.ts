/** 폼이 화면에서 들고 있는 상품. 새로 고른 사진과 이미 편성된 상품을 함께 담는다. */
export interface DraftProduct {
  id: string;
  /** 서버에 이미 있는 상품이면 그 번호. 수정 요청에 그대로 실어 보낸다. */
  productId?: number;
  /** 새로 고른 사진. 불러온 상품은 사진을 바꾸기 전까지 없다. */
  file?: File;
  /** 새 사진은 createObjectURL, 불러온 상품은 서버가 준 주소다. */
  previewUrl: string;
  name: string;
  price: number;
  stockQuantity: number;
  /** 사진을 올린 뒤 받은 값. 재시도에서 같은 사진을 또 올리지 않으려고 남긴다. */
  imageObjectKey?: string;
}
