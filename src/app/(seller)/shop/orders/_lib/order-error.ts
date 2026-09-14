import { ApiRequestError } from "@/lib/api-error";
import { ORDER_ERROR_CODE } from "@/types/order";

export function describeShipmentError(error: unknown) {
  if (error instanceof ApiRequestError) {
    if (error.code === ORDER_ERROR_CODE.ALREADY_SHIPPED) {
      return "이미 발송완료된 주문이에요.";
    }
    if (error.code === ORDER_ERROR_CODE.NOT_FOUND) {
      return "주문을 찾을 수 없어요.";
    }
  }
  return "운송장을 등록하지 못했어요. 다시 시도해 주세요.";
}
