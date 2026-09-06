export type LiveStatus = "READY" | "LIVE" | "ENDED";

export interface Live {
  liveId: number;
  publicId: string;
  sellerId: number;
  title: string;
  description?: string;
  status: LiveStatus;
  playbackUrl: string;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
}

/** 송출 권한 그 자체다. 로그·localStorage·쿼리스트링에 남기지 않는다. */
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

export interface LiveStreamStatus {
  status: LiveStatus;
  broadcasting: boolean;
  startedAt?: string;
}

export interface LivePlayback {
  playbackUrl: string;
  status: LiveStatus;
}

export const LIVE_ERROR_CODE = {
  CHANNEL_CREATE_FAILED: "LIVE_CHANNEL_CREATE_FAILED",
  TEMPORARILY_UNAVAILABLE: "LIVE_STREAMING_TEMPORARILY_UNAVAILABLE",
  NOT_FOUND: "LIVE_NOT_FOUND",
  FORBIDDEN: "LIVE_FORBIDDEN",
  ALREADY_ENDED: "LIVE_ALREADY_ENDED",
  ALREADY_BROADCASTING: "LIVE_ALREADY_BROADCASTING",
  CREDENTIAL_REISSUE_CONFLICT: "LIVE_CREDENTIAL_REISSUE_CONFLICT",
  CREDENTIAL_REISSUE_FAILED: "LIVE_CREDENTIAL_REISSUE_FAILED",
  STREAM_STATUS_FETCH_FAILED: "LIVE_STREAM_STATUS_FETCH_FAILED",
  BROADCAST_STOP_FAILED: "LIVE_BROADCAST_STOP_FAILED",
  STREAM_KEY_DELETE_FAILED: "LIVE_STREAM_KEY_DELETE_FAILED",
} as const;
