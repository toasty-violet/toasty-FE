import { notFound } from "next/navigation";

import { Header } from "@/components/headers/Header";

import { ProductDetailScreen } from "./_components/ProductDetailScreen";

export default async function ProductPage({
  params,
}: PageProps<"/products/[productId]">) {
  const { productId } = await params;
  const parsedProductId = Number(productId);

  // 상품 아이디는 링크 복사로 오가는 값이라, 숫자가 아닌 주소로도 들어올 수 있다.
  if (!Number.isInteger(parsedProductId) || parsedProductId <= 0) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* 검색 화면이 아직 없어 자리만 지킨다. */}
      <Header rightIconName="search" rightLabel="검색" />
      <ProductDetailScreen productId={parsedProductId} />
    </div>
  );
}
