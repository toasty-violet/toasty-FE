import SecureIcon from "@/assets/Secure.svg";

import { PaymentRegisterButton } from "./_components/PaymentRegisterButton";

const STEPS = [
  { title: "본인인증", description: "휴대폰 번호로 확인해요" },
  { title: "계좌 등록", description: "본인 명의 계좌만 등록할 수 있어요" },
  {
    title: "100원 결제 인증",
    badge: "즉시 환불",
    description: "계좌 확인용이라, 인증 즉시 돌려드려요",
  },
];

//구매자가 빠른 결제를 위해 계좌를 등록하는 온보딩 화면
export default function OnboardingCustomerPaymentRegisterPage() {
  return (
    <main className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-28 px-20 pt-20 pb-56">
        <div className="flex flex-col gap-12">
          <h1 className="text-t1-bold text-fg-neutral-solid">
            빠른 결제를 위해
            <br />
            계좌를 등록해주세요
          </h1>
          <p className="text-b3-regular text-fg-neutral-primary">
            한 번만 등록하면, 방송중에 바로 결제할 수 있어요!
          </p>
        </div>

        <ol className="flex flex-col gap-24">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-12">
              <span className="text-l5-semibold bg-bg-neutral-weak text-fg-neutral-secondary flex size-[2.2rem] shrink-0 items-center justify-center rounded-full">
                {index + 1}
              </span>

              <div className="flex min-w-0 flex-1 flex-col gap-4">
                <div className="flex items-center gap-6">
                  <h2 className="text-st1-semibold text-fg-neutral-strong">
                    {step.title}
                  </h2>
                  {step.badge && (
                    <span className="text-l7-semibold bg-bg-brand-weak text-fg-brand-contrast rounded-full px-8 py-6">
                      {step.badge}
                    </span>
                  )}
                </div>
                <p className="text-b3-medium text-fg-neutral-secondary">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="bg-bg-positive-weak rounded-12 flex items-center justify-center gap-8 px-12 py-10">
          <SecureIcon className="size-14 shrink-0 text-[var(--color-green-800)]" />
          <p className="text-c1-medium flex-1 text-[var(--color-green-800)]">
            계좌 비밀번호는 묻지 않아요.
            <br />
            등록 정보는 결제 용도로만 사용돼요.
          </p>
        </div>
      </div>

      <PaymentRegisterButton />
    </main>
  );
}
