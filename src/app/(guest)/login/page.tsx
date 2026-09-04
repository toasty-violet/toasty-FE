import Logo from "@/assets/Logo.svg";
import { KakaoLoginButton } from "@/components/buttons/KakaoLoginButton";

export default function LoginPage() {
  return (
    <div className="bg-bg-brand-solid flex flex-1 flex-col">
      <div className="pb-screen-bottom flex flex-1 flex-col items-center justify-center gap-28 p-20">
        <Logo className="size-[12rem]" />
        <p className="text-st2-semibold text-fg-neutral-inverted text-center">
          쉽고 간편하게 즐기는 라이브커머스
        </p>
      </div>

      <KakaoLoginButton />
    </div>
  );
}
