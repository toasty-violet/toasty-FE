import { SellerBusinessForm } from "../../_components/SellerBusinessForm";

export default function OnboardingSellerInfo2Page() {
  return (
    <main className="flex flex-1 flex-col pt-20">
      <h1 className="text-t1-bold text-fg-neutral-solid px-20 pb-28">
        사업자 정보를 등록해 주세요
      </h1>

      <SellerBusinessForm />
    </main>
  );
}
