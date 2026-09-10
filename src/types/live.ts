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

/** 화면에 셀러를 보여줄 때 필요한 것만 담는다. */
export interface SellerProfile {
  sellerId: number;
  shopName: string;
  shopImageUrl: string;
}

/**
 * 시청 화면 진입에 필요한 정보. 셀러 라이브(Live)와 달리 sellerId·createdAt 이
 * 없고 스토어 정보가 붙는다. 시청자 수는 계속 바뀌어 따로 받는다.
 */
export interface LiveViewer {
  liveId: number;
  publicId: string;
  title: string;
  description?: string;
  status: LiveStatus;
  playbackUrl: string;
  scheduledAt: string;
  startedAt?: string;
  endedAt?: string;
  seller: SellerProfile;
}

/** 송출 권한 그 자체다. 로그·localStorage·쿼리스트링에 남기지 않는다. */
export interface BroadcastCredential {
  ingestEndpoint: string;
  streamKey: string;
}

export type LiveProductStatus = "SCHEDULED" | "ACTIVE" | "CLOSED";

/** 편성된 상품. 사진은 주소로 오고, 수정에는 objectKey 를 보낸다. */
export interface LiveProduct {
  productId: number;
  /** 편성 번호. 방송 중 고정·구매에서 쓴다. */
  liveProductId: number;
  name: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
  displayOrder: number;
  status: LiveProductStatus;
}

/** 라이브 생성과 상세 조회가 같은 형태를 쓴다. 송출정보는 담기지 않는다. */
export interface LiveWithProducts {
  live: Live;
  products: LiveProduct[];
}

/** 라이브에 편성할 상품. imageObjectKey 는 업로드 주소 발급에서 받은 값이다. */
/** 방송 화면의 전체 상품 시트를 채운다. */
export interface LiveProducts {
  /** 지금 소개 중인 상품. 아직 아무것도 고정하지 않았으면 null. */
  currentPinnedProductId: number | null;
  /** 노출 순서대로. */
  products: LiveProduct[];
}

/** 방송 중에는 가격과 재고만 고칠 수 있다. */
export interface LiveProductUpdateRequest {
  price: number;
  stockQuantity: number;
}

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

/** 보내지 않은 항목은 그대로 둔다. 상품은 전체 목록을 통째로 보낸다. */
export interface LiveUpdateRequest {
  title?: string;
  description?: string;
  scheduledAt?: string;
  products?: LiveProductUpsert[];
}

/** 기존 상품은 productId 를 그대로 두고, 새 상품은 뺀다. */
export interface LiveProductUpsert {
  productId?: number;
  name: string;
  price: number;
  stockQuantity: number;
  /** 사진을 바꾸지 않으면 보내지 않는다. 새 상품이면 필수다. */
  imageObjectKey?: string;
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
  CHAT_ROOM_NOT_FOUND: "LIVE_CHAT_ROOM_NOT_FOUND",
  CHAT_TOKEN_ISSUE_FAILED: "LIVE_CHAT_TOKEN_ISSUE_FAILED",
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

/** 서버가 로그인 유저와 방송 주인을 대조해 정한다. 화면은 보낸 사람을 그리는 데만 쓴다. */
export type ChatRole = "SELLER" | "CUSTOMER" | "GUEST";

export interface LiveChatToken {
  token: string;
  /** 접속한 세션이 유지되는 시각. 이 전에 다시 받아야 채팅이 끊기지 않는다. */
  expiresAt: string;
  /** 비로그인과 종료된 방송은 읽기만 된다. */
  writable: boolean;
}
