"use client";

import RightSmallIcon from "@/assets/RightSmall.svg";
import { clearSession, logout } from "@/lib/auth";

function AccountRow({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between"
    >
      <span className="text-b3-medium text-fg-neutral-solid">{label}</span>
      <RightSmallIcon className="text-fg-neutral-icon size-24 shrink-0" />
    </button>
  );
}

export function AccountCard() {
  //서버 요청이 실패해도 클라이언트 세션은 비워야 로그아웃된 것으로 보인다.
  //세션을 비우면 아직 /me 에 있는 RouteGuard 가 guest 를 보고 /login 으로 먼저
  //보내버린다. 통째로 다시 불러 가드가 낄 렌더 자체를 없애고 홈으로 간다.
  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      clearSession();
      window.location.replace("/");
    }
  };

  return (
    <section className="bg-bg-layer-default rounded-12 flex w-full flex-col gap-16 p-16">
      <AccountRow label="로그아웃" onClick={handleLogout} />
      <AccountRow label="회원탈퇴" onClick={() => {}} />
    </section>
  );
}
