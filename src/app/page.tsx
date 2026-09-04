import { LoginButton } from "@/components/LoginButton";
import { CustomerNav } from "@/components/navigations/CustomerNav";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <main className="flex flex-1 flex-col items-center justify-center">
        <LoginButton />
      </main>
      <CustomerNav />
    </div>
  );
}
