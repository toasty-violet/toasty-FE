import { RoleSelectForm } from "./_components/RoleSelectForm";

export default function OnboardingPage() {
  return (
    <main className="flex flex-1 flex-col">
      <h1 className="text-t1-bold text-fg-neutral-solid px-20 pt-20 whitespace-pre-line">
        {"토스티에서 이용할\n역할을 선택해 주세요"}
      </h1>
      <RoleSelectForm />
    </main>
  );
}
