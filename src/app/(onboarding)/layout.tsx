import { RouteGuard } from "@/components/RouteGuard";

//로그인은 했지만 아직 역할을 고르지 않은 유저(role이 없느 사람)만 접속할 수 있다.
export default function OnboardingLayout({ children }: LayoutProps<"/">) {
  return <RouteGuard require="onboarding">{children}</RouteGuard>;
}
