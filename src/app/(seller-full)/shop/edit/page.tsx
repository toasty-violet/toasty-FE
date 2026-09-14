import { Header } from "@/components/headers/Header";

import { ShopEditScreen } from "./_components/ShopEditScreen";

export default function ShopEditPage() {
  return (
    <main className="flex flex-1 flex-col">
      <Header title="스토어 정보 수정" />

      <ShopEditScreen />
    </main>
  );
}
