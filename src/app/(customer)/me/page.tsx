import { AccountCard } from "@/components/cards/AccountCard";
import { ProfileCard } from "@/components/cards/ProfileCard";
import { SupportCard } from "@/components/cards/SupportCard";

export default function MyPage() {
  return (
    <main className="bg-bg-neutral-weak flex flex-1 flex-col gap-28 p-20">
      <ProfileCard />
      <AccountCard />
      <SupportCard />
    </main>
  );
}
