export type LiveStatus = "READY" | "LIVE" | "ENDED";

export interface Live {
  liveId: number;
  publicId: string;
  sellerId: number;
  title: string;
  description?: string;
  status: LiveStatus;
  /** 방송 예정 시각. 이 시각에 자동으로 시작되지는 않는다. */
  scheduledAt: string;
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

/** 라이브에 편성할 상품. imageObjectKey 는 업로드 주소 발급에서 받은 값이다. */
export interface LiveProductInput {
  name: string;
  price: number;
  stockQuantity: number;
  description?: string;
  imageObjectKey: string;
}

export interface LiveCreateRequest {
  title: string;
  description?: string;
  scheduledAt: string;
  products: LiveProductInput[];
}

export interface ProductImageUploadFile {
  contentType: string;
  contentLength: number;
}

export interface ProductImageUpload {
  /** 라이브 생성 요청에 그대로 넣는다. */
  objectKey: string;
  /** 이 주소로 사진 본문만 PUT 한다. */
  uploadUrl: string;
  expiresIn: number;
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

/** 셀러 라이브탭 한 화면. 세 필드가 화면의 세 구역에 대응한다. */
export interface SellerLiveTab {
  /** 주문·시청자 집계가 생기기 전까지 서버가 항상 null 을 준다. */
  latestStat: SellerLiveStat | null;
  /** 지금 방송 중인 라이브. 없으면 null. */
  broadcasting: SellerBroadcastingLive | null;
  /** 방송 예정 시각 오름차순. */
  scheduled: SellerScheduledLive[];
}

export interface SellerLiveStat {
  viewerCount: number;
  orderCount: number;
  salesAmount: number;
}

export interface SellerBroadcastingLive {
  liveId: number;
  publicId: string;
  title: string;
  playbackUrl: string;
  /** 판매율(%). 주문 집계가 없어 당분간 0 이다. */
  sellThroughRate: number;
}

export interface SellerScheduledLive {
  liveId: number;
  publicId: string;
  title: string;
  scheduledAt: string;
  productCount: number;
}
