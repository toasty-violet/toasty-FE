import { AccountCard } from "@/components/cards/AccountCard";
import { SupportCard } from "@/components/cards/SupportCard";

export default function MyPage() {
  return (
    <main className="bg-bg-neutral-weak flex flex-1 flex-col gap-28 p-20">
      <AccountCard />
      <SupportCard />
    </main>
  );
}
