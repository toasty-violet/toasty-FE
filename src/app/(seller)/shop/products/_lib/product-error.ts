import { ApiRequestError } from "@/lib/api-error";
import { PRODUCT_ERROR_CODE } from "@/types/product";

/** 삭제가 거부되는 이유는 둘 뿐이라 그대로 안내한다. */
export function describeDeleteError(error: unknown) {
  if (!(error instanceof ApiRequestError)) {
    return "상품을 삭제하지 못했어요. 다시 시도해 주세요.";
  }
  if (error.code === PRODUCT_ERROR_CODE.BROADCASTING) {
    return "방송 중인 라이브에 편성된 상품이에요. 방송이 끝난 뒤에 삭제할 수 있어요.";
  }
  if (error.code === PRODUCT_ERROR_CODE.LAST_IN_LIVE) {
    return "이 상품을 지우면 편성된 라이브에 상품이 하나도 남지 않아요.";
  }
  return "상품을 삭제하지 못했어요. 다시 시도해 주세요.";
}

/** 수정도 방송 중이면 막힌다. */
export function describeUpdateError(error: unknown) {
  if (
    error instanceof ApiRequestError &&
    error.code === PRODUCT_ERROR_CODE.BROADCASTING
  ) {
    return "방송 중인 라이브에 편성된 상품이에요. 방송 화면에서 고칠 수 있어요.";
  }
  return "상품을 저장하지 못했어요. 다시 시도해 주세요.";
}
