import type { CustomerOnboardingDraft } from "@/types/user";

const DRAFT_KEY = "customer-onboarding-draft";

/**
 * 구매자 온보딩 1단계 입력을 결제 등록 화면까지 들고 가기 위한 임시 보관소.
 *
 * 결제창은 외부로 나갔다가 successUrl 로 돌아오면서 페이지를 새로 띄우므로,
 * 메모리 상태로는 값이 남지 않아 sessionStorage 를 쓴다.
 * 온보딩을 마치거나 벗어날 때 반드시 비운다.
 */
export function saveOnboardingDraft(draft: CustomerOnboardingDraft) {
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function loadOnboardingDraft(): CustomerOnboardingDraft | null {
  const raw = sessionStorage.getItem(DRAFT_KEY);
  if (!raw) return null;

  // 손으로 고친 값이 들어와도 화면이 죽지 않고 1단계로 되돌아가게 한다.
  try {
    return JSON.parse(raw) as CustomerOnboardingDraft;
  } catch {
    return null;
  }
}

export function clearOnboardingDraft() {
  sessionStorage.removeItem(DRAFT_KEY);
}
