import { RouteGuard } from "@/components/RouteGuard";

//SELLER 전용 화면에 적용할 레이아웃. role = SELLER가 아닌 사람은 해당 페이지에 접근 불가
export default function SellerLayout({ children }: LayoutProps<"/">) {
  return <RouteGuard require="SELLER">{children}</RouteGuard>;
}
