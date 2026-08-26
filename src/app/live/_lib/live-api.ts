import { apiClient } from "@/lib/api-client";
import type { ApiSuccess } from "@/types/api";
import type {
  BroadcastCredential,
  Live,
  LiveCreateRequest,
  LiveCreateResponse,
  LivePlayback,
  LiveStreamStatus,
} from "@/types/live";

export async function createLive(
  request: LiveCreateRequest,
): Promise<LiveCreateResponse> {
  const { data } = await apiClient.post<ApiSuccess<LiveCreateResponse>>(
    "/lives",
    request,
  );
  return data.data;
}

/**
 * 공용 조회라 인증이 필요 없고, 송출정보도 담기지 않는다.
 * 순차 liveId를 시청 URL에 노출하지 않으려고 공개 조회는 publicId만 받는다.
 */
export async function getLive(publicId: string): Promise<Live> {
  const { data } = await apiClient.get<ApiSuccess<Live>>(
    `/lives/public/${publicId}`,
  );
  return data.data;
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
export async function getLivePlayback(liveId: number): Promise<LivePlayback> {
  const { data } = await apiClient.get<ApiSuccess<LivePlayback>>(
    `/lives/${liveId}/playback`,
  );
  return data.data;
}

export async function endLive(liveId: number): Promise<Live> {
  const { data } = await apiClient.post<ApiSuccess<Live>>(
    `/lives/${liveId}/end`,
  );
  return data.data;
}
