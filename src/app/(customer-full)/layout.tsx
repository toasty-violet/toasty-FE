import { RouteGuard } from "@/components/RouteGuards/RouteGuard";

// CUSTOMER 전용 화면 중 하단 네비게이션 없이 화면을 다 쓰는 레이아웃.
// 하단이 제출 버튼인 화면은 탭이 함께 보이면 안 되므로 (customer) 와 나눠 둔다.
export default function CustomerFullLayout({ children }: LayoutProps<"/">) {
  return <RouteGuard require="CUSTOMER">{children}</RouteGuard>;
}
