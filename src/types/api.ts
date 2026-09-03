export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  /** COMMON_INVALID_INPUT 일 때만 내려온다. */
  fields?: ApiFieldError[];
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

/** 실패 응답은 인터셉터가 ApiRequestError 로 바꿔 던지므로 호출부까지 오지 않는다. */
export interface ApiFailure {
  success: false;
  error: ApiErrorBody;
}
