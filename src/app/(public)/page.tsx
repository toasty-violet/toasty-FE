import { Header } from "@/components/headers/Header";
import { CustomerNav } from "@/components/navigations/CustomerNav";
import { HomeRedirect } from "./_components/HomeRedirect";
import { LiveGuideSection } from "./_components/LiveGuideSection";

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
      </main>
      <CustomerNav />
    </div>
  );
}
