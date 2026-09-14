import { OnboardingComplete } from "../../../_components/OnboardingComplete";

export default function OnboardingSellerCompletePage() {
  return (
    <OnboardingComplete
      title="입점이 완료되었습니다!"
      description="이제 나만의 라이브를 시작해보세요."
      homePath="/shop"
    />
  );
}
