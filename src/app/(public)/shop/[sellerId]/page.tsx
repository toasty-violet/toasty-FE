import { notFound } from "next/navigation";

import { Header } from "@/components/headers/Header";

import { SellerProfileSection } from "./_components/SellerProfileSection";
import { StoreProductsSection } from "./_components/StoreProductsSection";

export default async function SellerShopPage({
  params,
}: PageProps<"/shop/[sellerId]">) {
  const { sellerId } = await params;
  const parsedSellerId = Number(sellerId);

  // 셀러 아이디는 링크 복사로 오가는 값이라, 숫자가 아닌 주소로도 들어올 수 있다.
  if (!Number.isInteger(parsedSellerId) || parsedSellerId <= 0) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* 검색 화면이 아직 없어 자리만 지킨다. */}
      <Header rightIconName="search" rightLabel="검색" />
      <main className="flex flex-1 flex-col gap-36 px-20 pb-56">
        <SellerProfileSection sellerId={parsedSellerId} />
        <StoreProductsSection sellerId={parsedSellerId} />
      </main>
    </div>
  );
}
