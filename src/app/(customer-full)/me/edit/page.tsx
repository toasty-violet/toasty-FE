import { Header } from "@/components/headers/Header";

import { CustomerProfileEditForm } from "./_components/CustomerProfileEditForm";

export default function MyInfoEditPage() {
  return (
    <main className="flex flex-1 flex-col">
      <Header title="내 정보 수정" />

      <CustomerProfileEditForm />
    </main>
  );
}
