import type { ApiFieldError } from "@/types/api";

/**
 * 서버가 공통 실패 껍데기로 내려준 오류.
 * 분기 처리는 message가 아니라 code로 한다.
 *
 * (본문 타입은 types/api.ts 의 ApiErrorBody, 이쪽은 throw 되는 예외다.)
 */
export class ApiRequestError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
    readonly fields?: ApiFieldError[],
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}
