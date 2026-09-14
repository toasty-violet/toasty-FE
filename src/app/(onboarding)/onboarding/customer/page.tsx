import { CustomerOnboardingForm } from "../_components/CustomerOnboardingForm";

export default function OnboardingCustomerPage() {
  return (
    <main className="flex flex-1 flex-col pt-20">
      <h1 className="text-t1-bold text-fg-neutral-solid px-20 pb-28">
        기본 정보를 등록해 주세요
      </h1>

      <CustomerOnboardingForm />
    </main>
  );
}
