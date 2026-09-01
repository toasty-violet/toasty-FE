import { apiClient } from "./api-client";
import type { ApiSuccess } from "@/types/api";
import type { Live, LiveCreateRequest, LiveCreateResponse } from "@/types/live";

/**
 * 라이브를 만들고 IVS 채널을 발급받는다.
 *
 * 응답의 broadcastCredential.streamKey는 서버가 저장하지 않아 이 응답에서만 받을 수 있다.
 * 호출부는 이 값을 메모리 밖으로 내보내지 않는다.
 */
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
