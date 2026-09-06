import { Header } from "@/components/headers/Header";
import { CustomerNav } from "@/components/navigations/CustomerNav";
import { HomeRedirect } from "./_components/HomeRedirect";

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
      <main className="flex flex-1 flex-col" />
      <CustomerNav />
    </div>
  );
}
