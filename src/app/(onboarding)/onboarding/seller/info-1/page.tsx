import { SellerInfoForm } from "../../_components/SellerInfoForm";

export default function OnboardingSellerInfo1Page() {
  return (
    <main className="flex flex-1 flex-col pt-20">
      <h1 className="text-t1-bold text-fg-neutral-solid px-20 pb-28 whitespace-pre-line">
        {"구매자에게 보여질\n스토어 정보를 등록해 주세요"}
      </h1>

      <SellerInfoForm />
    </main>
  );
}
