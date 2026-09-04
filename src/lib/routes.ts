import type { User } from "@/types/user";

// 역할에 맞는 첫 화면. 가드가 쫓아낼 때와 홈에서 안내할 때 같은 규칙을 써야
// 한쪽만 바뀌어 서로 튕겨내는 리다이렉트 루프가 생기지 않는다.
export function homePathFor(user: User | null) {
  if (user?.role === "SELLER") {
    return "/shop";
  }
  // 역할 미선택 유저는 role 키 자체가 없어 undefined 로 들어온다
  if (user && !user.role) {
    return "/onboarding";
  }
  return "/";
}
