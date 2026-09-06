"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { BottomButton } from "@/components/buttons/BottomButton";
import {
  clearOnboardingDraft,
  loadOnboardingDraft,
} from "@/app/(onboarding)/onboarding/_lib/onboarding-draft";
import { fetchPayerIdSession } from "@/lib/payment";
import { loadPoint3Widgets, requestPoint3Payment } from "@/lib/point3";
import { submitCustomerOnboarding } from "@/lib/user";
import { useUserStore } from "@/store/user-store";

const ORDER_NAME = "toasty 계좌 등록";

/**
 * 계좌 등록을 시작하고, 등록을 마친 뒤 온보딩 제출까지 잇는다.
 *
 * 등록창은 successUrl/failUrl 로 이 화면에 다시 진입하므로,
 * 쿼리 파라미터를 보고 이어서 제출할지 실패 안내를 띄울지 가른다.
 */
export function PaymentRegisterButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useUserStore((state) => state.setUser);
  const [error, setError] = useState("");

  // 등록 실패로 돌아온 경우 point3 가 code/message 를 실어 보낸다.
  const failMessage = searchParams.get("message");
  // 등록 성공으로 돌아온 경우에만 orderId(=sessionId)가 붙는다.
  const paidSessionId = searchParams.get("orderId");

  const onboarding = useMutation({
    mutationFn: submitCustomerOnboarding,
    onSuccess: (_, variables) => {
      // 개인정보를 남기지 않도록 제출 직후 비운다.
      clearOnboardingDraft();
      // 역할이 정해졌으므로 store 를 갱신해야 완료 화면의 가드를 통과한다.
      setUser({ role: "CUSTOMER", nickname: variables.nickname });
      router.replace("/onboarding/customer/complete");
    },
    onError: () => {
      setError("가입에 실패했어요. 다시 시도해 주세요.");
    },
  });

  // 1단계를 건너뛰고 들어온 경우 되돌려보낸다.
  useEffect(() => {
    if (loadOnboardingDraft()) return;
    router.replace("/onboarding/customer");
  }, [router]);

  // 계좌 등록을 마치고 돌아왔으면 기본 정보와 세션을 함께 제출한다.
  useEffect(() => {
    if (!paidSessionId) return;

    const draft = loadOnboardingDraft();
    if (!draft) return;

    onboarding.mutate({ ...draft, sessionId: paidSessionId });
    // 제출은 등록 복귀당 한 번이면 된다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paidSessionId]);

  const registration = useMutation({
    mutationFn: async () => {
      // 세션 발급과 SDK 로드는 서로 무관해 함께 기다린다.
      const [sessionId, widgets] = await Promise.all([
        fetchPayerIdSession(),
        loadPoint3Widgets(),
      ]);

      await requestPoint3Payment(widgets, { sessionId, orderName: ORDER_NAME });
    },
    onError: () => {
      setError("계좌 등록창을 열지 못했어요. 다시 시도해 주세요.");
    },
  });

  // 등록 후 제출까지 이어지는 동안에는 버튼을 다시 누를 수 없어야 한다.
  const pending =
    registration.isPending || onboarding.isPending || !!paidSessionId;
  const message = error || failMessage;

  return (
    <>
      {message && (
        <p className="text-b3-medium text-fg-critical px-20 text-center">
          {message}
        </p>
      )}

      <BottomButton
        label={pending ? "진행 중…" : "계좌 등록하기"}
        disabled={pending}
        description="등록을 마치면 회원가입이 완료돼요"
        onClick={() => {
          setError("");
          registration.mutate();
        }}
      />
    </>
  );
}
