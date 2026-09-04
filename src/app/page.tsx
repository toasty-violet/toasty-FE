import { BottomBar } from "@/components/BottomBar";
import { Header } from "@/components/Header";
import { LoginButton } from "@/components/LoginButton";
import { CustomerNav } from "@/components/navigations/CustomerNav";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Header
        showBack={false}
        rightIconName="search"
        rightHref="/search"
        rightLabel="검색"
      />
      <main className="flex flex-1 flex-col items-center justify-center">
        <LoginButton />
      </main>
      <CustomerNav />
    </div>
  );
}
