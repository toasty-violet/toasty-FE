import { RouteGuard } from "@/components/RouteGuards/RouteGuard";

// 온보딩을 막 마친 순간은 "역할 미선택"도 "역할 확정"도 아닌 과도기다.
// role 로 판정하는 (onboarding)·(seller) 가드는 이 상태를 통과시키지 못하므로,
// 완료 화면은 로그인 여부만 확인한다.
export default function OnboardingCompleteLayout({
  children,
}: LayoutProps<"/">) {
  return <RouteGuard require="authed">{children}</RouteGuard>;
}
