export type LiveStatus = "READY" | "LIVE" | "ENDED";

export interface Live {
  liveId: number;
  publicId: string;
  sellerId: number;
  title: string;
  description?: string;
  status: LiveStatus;
  /** IVS Player SDK에 넘길 HLS 재생 URL */
  playbackUrl: string;
  createdAt: string;
  /** 값이 있을 때만 내려온다. READY 상태에서는 필드 자체가 없다. */
  startedAt?: string;
  endedAt?: string;
}

/**
 * 송출 권한 그 자체다. 라이브 생성 응답에서만 받을 수 있고 서버가 저장하지 않는다.
 * 로그·localStorage·쿼리스트링에 남기지 말고 메모리에만 들고 있는다.
 */
export interface BroadcastCredential {
  ingestEndpoint: string;
  streamKey: string;
}

export interface LiveCreateResponse {
  live: Live;
  broadcastCredential: BroadcastCredential;
}

export interface LiveCreateRequest {
  title: string;
  description?: string;
}

export const LIVE_ERROR_CODE = {
  /** 채널 생성 실패. 서버 설정·권한 문제라 재시도해도 똑같이 실패한다. */
  CHANNEL_CREATE_FAILED: "LIVE_CHANNEL_CREATE_FAILED",
  /** 일시적 장애. 잠시 후 재시도하면 성공할 수 있다. */
  TEMPORARILY_UNAVAILABLE: "LIVE_STREAMING_TEMPORARILY_UNAVAILABLE",
  NOT_FOUND: "LIVE_NOT_FOUND",
} as const;
