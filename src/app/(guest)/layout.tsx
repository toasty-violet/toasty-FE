import { RouteGuard } from "@/components/RouteGuard";

//비로그인 전용 화면. 이미 로그인한 유저는 role에 맞는 화면으로 돌려보낸다
export default function GuestLayout({ children }: LayoutProps<"/">) {
  return <RouteGuard require="guest">{children}</RouteGuard>;
}
