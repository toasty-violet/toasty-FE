import type { ApiSuccess } from "@/types/api";

export type UserRole = "SELLER" | "CUSTOMER";

// /users/me 에서 내려주는 유저 정보
// 역할을 아직 고르지 않은 유저는 role 이 아예 내려오지 않는다
export interface User {
  role?: UserRole | null;
  nickname: string;
}

// 내 정보 조회 API 응답
export type MeResponse = ApiSuccess<User>;
