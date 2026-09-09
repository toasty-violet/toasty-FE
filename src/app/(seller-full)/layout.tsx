import { RouteGuard } from "@/components/RouteGuards/RouteGuard";

// SELLER 전용 화면 중 하단 네비게이션 없이 화면을 다 쓰는 레이아웃.
// 하단이 제출 버튼이거나 방송 화면인 경우 탭이 함께 보이면 안 되므로 (seller) 와 나눠 둔다.
export default function SellerFullLayout({ children }: LayoutProps<"/">) {
  return <RouteGuard require="SELLER">{children}</RouteGuard>;
}
