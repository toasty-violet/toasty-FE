import type { ApiSuccess } from "@/types/api";

// 결제 세션 발급 응답. point3 세션 생성 결과의 id 를 sessionId 로 받는다.
export type PayerIdSessionResponse = ApiSuccess<{ sessionId: string }>;
