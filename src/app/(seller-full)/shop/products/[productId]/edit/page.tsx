import { Header } from "@/components/headers/Header";

import { ProductEditScreen } from "@/app/(seller)/shop/products/_components/ProductEditScreen";

export default async function ProductEditPage({
  params,
}: PageProps<"/shop/products/[productId]/edit">) {
  const { productId } = await params;

  return (
    <>
      <Header title="상품 수정" />
      <ProductEditScreen productId={Number(productId)} />
    </>
  );
}
