// info-1 과 info-2 는 별개의 라우트라 입력값이 메모리에 남지 않는다.
// 오보딩 완료 폼을 한 번에 제출하기 위해 로컬 스토리지에 폼 정보를 저장한다.
const STORAGE_KEY = "seller-onboarding-draft";

export type SellerOnboardingDraft = {
  shopName: string;
  description: string;
  /** 샵 이미지 사진의 S3 객체 키. */
  shopImageObjectKey: string;
};

export const EMPTY_DRAFT: SellerOnboardingDraft = {
  shopName: "",
  description: "",
  shopImageObjectKey: "",
};

export function readSellerDraft(): SellerOnboardingDraft {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return EMPTY_DRAFT;

  try {
    const stored = JSON.parse(raw) as Partial<SellerOnboardingDraft>;
    return {
      shopName: stored.shopName ?? "",
      description: stored.description ?? "",
      shopImageObjectKey: stored.shopImageObjectKey ?? "",
    };
  } catch {
    // 사용자가 직접 건드릴 수 있는 값이라 깨진 JSON 을 만나도 빈 값으로 이어간다.
    return EMPTY_DRAFT;
  }
}

export function saveSellerDraft(draft: Partial<SellerOnboardingDraft>) {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...readSellerDraft(), ...draft }),
  );
}
