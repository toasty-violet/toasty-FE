"use client";

import { useEffect, useRef, useState } from "react";
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
  const [error, setError] = useState("");

  // 등록 실패로 돌아온 경우 point3 가 code/message 를 실어 보낸다.
  const failMessage = searchParams.get("message");
  // 등록 성공으로 돌아온 경우에만 orderId(=sessionId)가 붙는다.
  const paidSessionId = searchParams.get("orderId");

  const onboarding = useMutation({
    mutationFn: submitCustomerOnboarding,
    onSuccess: () => {
      // 개인정보를 남기지 않도록 제출 직후 비운다.
      clearOnboardingDraft();
      // role 을 여기서 바꾸면 아직 (onboarding) 안이라 그 가드가 먼저 반응해
      // 완료 화면 대신 제 역할의 홈으로 밀어낸다. 갱신은 도착한 화면에 맡긴다.
      router.replace("/onboarding/customer/complete");
    },
    onError: () => {
      setError("가입에 실패했어요. 다시 시도해 주세요.");
      // orderId 가 남아 있으면 재시도 버튼이 잠긴 채로 굳으므로 쿼리를 털어낸다.
      router.replace("/onboarding/customer/payment-register");
    },
  });

  // 1단계를 건너뛰고 들어온 경우 되돌려보낸다.
  useEffect(() => {
    if (loadOnboardingDraft()) return;
    router.replace("/onboarding/customer");
  }, [router]);

  // 이미 제출한 세션. 세션 하나는 한 번만 쓸 수 있으므로 재제출을 막는다.
  // StrictMode 는 개발 모드에서 effect 를 두 번 실행하고, 복귀 URL 을 새로고침해도
  // 같은 orderId 로 다시 들어온다. 의존성 배열로는 둘 다 막지 못해 ref 로 기억한다.
  const submittedSessionId = useRef<string | null>(null);

  // 계좌 등록을 마치고 돌아왔으면 기본 정보와 세션을 함께 제출한다.
  useEffect(() => {
    if (!paidSessionId) return;
    if (submittedSessionId.current === paidSessionId) return;

    const draft = loadOnboardingDraft();
    if (!draft) return;

    submittedSessionId.current = paidSessionId;
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
  // 복귀 직후 제출이 시작되기 전 한 틱도 눌리면 안 되므로 orderId 도 함께 본다.
  // 제출이 실패하면 위에서 orderId 를 지워 이 잠금이 풀린다.
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
