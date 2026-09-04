import { ApiRequestError } from "@/lib/api-error";
import { LIVE_ERROR_CODE } from "@/types/live";

export function describeLiveError(error: unknown): {
  message: string;
  canRetry: boolean;
} {
  if (!(error instanceof ApiRequestError)) {
    return {
      message: "서버에 연결할 수 없습니다. 백엔드가 떠 있는지 확인해주세요.",
      canRetry: true,
    };
  }

  switch (error.code) {
    case LIVE_ERROR_CODE.TEMPORARILY_UNAVAILABLE:
    case LIVE_ERROR_CODE.CREDENTIAL_REISSUE_CONFLICT:
      return {
        message: `${error.message} 잠시 후 다시 시도해주세요.`,
        canRetry: true,
      };

    case LIVE_ERROR_CODE.BROADCAST_STOP_FAILED:
    case LIVE_ERROR_CODE.STREAM_KEY_DELETE_FAILED:
      return {
        message: `${error.message} 아직 종료되지 않았으니 다시 시도해주세요.`,
        canRetry: true,
      };

    case LIVE_ERROR_CODE.CHANNEL_CREATE_FAILED:
    case LIVE_ERROR_CODE.CREDENTIAL_REISSUE_FAILED:
    case LIVE_ERROR_CODE.STREAM_STATUS_FETCH_FAILED:
      return {
        message: `${error.message} 재시도해도 같은 결과라 백엔드에 알려야 합니다.`,
        canRetry: false,
      };

    case LIVE_ERROR_CODE.ALREADY_BROADCASTING:
      return {
        message:
          "이미 다른 라이브를 방송 중입니다. 그 방송을 먼저 종료해주세요.",
        canRetry: false,
      };

    default:
      return { message: error.message, canRetry: false };
  }
}
