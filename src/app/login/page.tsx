import Logo from "@/assets/logo.svg";
import { KakaoLoginButton } from "@/components/KakaoLoginButton";

export default function LoginPage() {
  return (
    <div className="bg-bg-brand-solid flex flex-1 flex-col items-center justify-center gap-[3rem]">
      <div className="flex h-fit w-full flex-1 flex-col items-center justify-center gap-[3rem]">
        <Logo />
        <span>쉽고 간편하게 즐기는 라이브커머스</span>
      </div>

      <div className="h-fit w-full items-center justify-center gap-[1rem] p-[2rem]">
        <KakaoLoginButton />
      </div>
    </div>
  );
}
