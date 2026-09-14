import { Header } from "@/components/headers/Header";
import { CustomerNav } from "@/components/navigations/CustomerNav";
import { FollowedStoreSection } from "./_components/FollowedStoreSection";
import { HomeRedirect } from "./_components/HomeRedirect";
import { LiveGuideSection } from "./_components/LiveGuideSection";
import { StoreTop3Section } from "./_components/StoreTop3Section";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <HomeRedirect />
      <Header
        showBack={false}
        rightIconName="search"
        rightHref="/search"
        rightLabel="검색"
      />
      <main className="flex flex-1 flex-col gap-36 px-20 pb-56">
        <section className="flex w-full flex-col gap-14">
          <h2 className="text-t3-bold text-fg-neutral-solid">
            <span className="text-fg-brand">토스티</span> 라이브 가이드
          </h2>
          <LiveGuideSection />
        </section>
        <section className="flex w-full flex-col gap-14">
          <h2 className="text-t3-bold text-fg-neutral-solid w-full">
            팔로우하는 스토어
          </h2>
          <FollowedStoreSection />
        </section>
        <section className="flex w-full flex-col gap-14">
          <h2 className="text-t3-bold text-fg-neutral-solid w-full">
            스토어 TOP3
          </h2>
          <StoreTop3Section />
        </section>
      </main>
      <CustomerNav />
    </div>
  );
}
