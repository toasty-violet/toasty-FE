import { BottomBar } from "@/components/BottomBar";
import { LoginButton } from "@/components/LoginButton";
import { HomeRedirect } from "./_components/HomeRedirect";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <HomeRedirect />
      <main className="flex flex-1 flex-col items-center justify-center">
        <LoginButton />
      </main>
      <BottomBar />
    </div>
  );
}
