import { BottomBar } from "@/components/BottomBar";
import { LoginButton } from "@/components/LoginButton";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <main className="flex flex-1 flex-col items-center justify-center">
        <LoginButton />
      </main>
      <BottomBar />
    </div>
  );
}
