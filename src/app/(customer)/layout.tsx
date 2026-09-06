import { RouteGuard } from "@/components/RouteGuard";

// CUSTOMER 전용 화면에 적용할 레이아웃. role = CUSTOMER가 아닌 사람은 해당 페이지에 접근 불가
export default function CustomerLayout({ children }: LayoutProps<"/">) {
  return <RouteGuard require="CUSTOMER">{children}</RouteGuard>;
}
