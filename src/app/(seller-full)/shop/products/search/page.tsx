import { Header } from "@/components/headers/Header";

import { ProductSearchScreen } from "@/app/(seller)/shop/products/_components/ProductSearchScreen";

export default function ProductSearchPage() {
  return (
    <>
      <Header title="상품 검색" />
      <ProductSearchScreen />
    </>
  );
}
