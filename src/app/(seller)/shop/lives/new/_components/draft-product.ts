/** 아직 서버에 올리기 전, 화면에서만 들고 있는 상품. */
export interface DraftProduct {
  id: string;
  file: File;
  /** createObjectURL 로 만든 미리보기 주소. 화면을 벗어날 때 해제한다. */
  previewUrl: string;
  name: string;
  price: number;
  stockQuantity: number;
  /** 사진을 올린 뒤 받은 값. 재시도에서 같은 사진을 또 올리지 않으려고 남긴다. */
  imageObjectKey?: string;
}
