import { apiClient } from "@/lib/api-client";
import type { ApiSuccess } from "@/types/api";
import type {
  BroadcastCredential,
  Live,
  LiveCreateRequest,
  LiveWithProducts,
  LiveUpdateRequest,
  LivePlayback,
  LiveProducts,
  LiveProductUpdateRequest,
  LiveViewer,
  LiveStreamStatus,
  ProductImageUpload,
  ProductImageUploadFile,
  SellerLiveTab,
} from "@/types/live";

export async function createLive(
  request: LiveCreateRequest,
): Promise<LiveWithProducts> {
  const { data } = await apiClient.post<ApiSuccess<LiveWithProducts>>(
    "/lives",
    request,
  );
  return data.data;
}

/**
 * 공용 조회라 인증이 필요 없고, 송출정보도 담기지 않는다.
 * 순차 liveId를 시청 URL에 노출하지 않으려고 공개 조회는 publicId만 받는다.
 */
export async function getLive(publicId: string): Promise<LiveViewer> {
  const { data } = await apiClient.get<ApiSuccess<LiveViewer>>(
    `/lives/public/${publicId}`,
  );
  return data.data;
}

/** 시청자 수는 계속 바뀌어 라이브 정보와 따로 받는다. */
export async function getViewerCount(publicId: string): Promise<number> {
  const { data } = await apiClient.get<ApiSuccess<{ viewerCount: number }>>(
    `/lives/public/${publicId}/viewer-count`,
  );
  return data.data.viewerCount;
}

/** 이전 키가 즉시 무효가 되므로 송출 중에 부르면 방송이 끊긴다. */
export async function reissueBroadcastCredential(
  liveId: number,
): Promise<BroadcastCredential> {
  const { data } = await apiClient.post<ApiSuccess<BroadcastCredential>>(
    `/lives/${liveId}/broadcast-credentials`,
  );
  return data.data;
}

/** 이 호출이 READY → LIVE 전이를 일으킨다. 셀러 화면에서만 폴링한다. */
export async function getLiveStreamStatus(
  liveId: number,
): Promise<LiveStreamStatus> {
  const { data } = await apiClient.get<ApiSuccess<LiveStreamStatus>>(
    `/lives/${liveId}/stream-status`,
  );
  return data.data;
}

/** 시청자 대기 화면은 stream-status 대신 반드시 이쪽을 폴링한다 (IVS 쿼터). */
export async function getLivePlayback(publicId: string): Promise<LivePlayback> {
  const { data } = await apiClient.get<ApiSuccess<LivePlayback>>(
    `/lives/public/${publicId}/playback`,
  );
  return data.data;
}

export async function endLive(liveId: number): Promise<Live> {
  const { data } = await apiClient.post<ApiSuccess<Live>>(
    `/lives/${liveId}/end`,
  );
  return data.data;
}

/** 사진은 서버를 거치지 않고 S3 로 직접 올린다. 여기서는 올릴 주소만 받는다. */
export async function issueProductImageUploadUrls(
  files: ProductImageUploadFile[],
): Promise<ProductImageUpload[]> {
  const { data } = await apiClient.post<
    ApiSuccess<{ uploads: ProductImageUpload[] }>
  >("/seller/products/images/upload-url", { files });
  return data.data.uploads;
}

/**
 * 발급받은 주소로 사진 본문만 올린다.
 * presigned URL 이라 서명에 없는 헤더가 붙으면 403 이 난다.
 * apiClient 를 쓰면 Authorization 이 S3 로 나가므로 fetch 를 직접 쓴다.
 */
export async function uploadProductImage(uploadUrl: string, file: File) {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  if (!response.ok) {
    throw new Error(`사진을 올리지 못했습니다. (${response.status})`);
  }
}

/** 셀러 라이브탭 한 화면을 채운다. 방송 중·최신 현황·예정 목록을 함께 준다. */
export async function getSellerLiveTab(): Promise<SellerLiveTab> {
  const { data } = await apiClient.get<ApiSuccess<SellerLiveTab>>("/lives/me");
  return data.data;
}

/** 셀러가 자기 라이브 하나를 편성 상품까지 가져온다. 수정 화면의 초기값이 된다. */
export async function getLiveDetail(liveId: number): Promise<LiveWithProducts> {
  const { data } = await apiClient.get<ApiSuccess<LiveWithProducts>>(
    `/lives/${liveId}`,
  );
  return data.data;
}

/** 방송 전 라이브의 정보와 편성 상품을 고친다. */
export async function updateLive(liveId: number, body: LiveUpdateRequest) {
  await apiClient.patch(`/lives/${liveId}`, body);
}

/** 방송 전 라이브를 지운다. */
export async function deleteLive(liveId: number) {
  await apiClient.delete(`/lives/${liveId}`);
}

/** 시청 화면이 볼 편성 상품. 인증이 필요 없고 셀러 조회와 같은 형태를 준다. */
export async function getPublicLiveProducts(
  publicId: string,
): Promise<LiveProducts> {
  const { data } = await apiClient.get<ApiSuccess<LiveProducts>>(
    `/lives/public/${publicId}/products`,
  );
  return data.data;
}

/** 방송 화면의 전체 상품과 지금 고정된 상품을 함께 가져온다. */
export async function getLiveProducts(liveId: number): Promise<LiveProducts> {
  const { data } = await apiClient.get<ApiSuccess<LiveProducts>>(
    `/lives/${liveId}/products`,
  );
  return data.data;
}

/** 지금 소개할 상품을 바꾼다. */
export async function pinLiveProduct(liveId: number, productId: number) {
  await apiClient.patch(`/lives/${liveId}/products/${productId}/pin`);
}

/** 방송 중에는 가격과 재고만 고칠 수 있다. */
export async function updateLiveProduct(
  liveId: number,
  productId: number,
  body: LiveProductUpdateRequest,
) {
  await apiClient.patch(`/lives/${liveId}/products/${productId}`, body);
}
