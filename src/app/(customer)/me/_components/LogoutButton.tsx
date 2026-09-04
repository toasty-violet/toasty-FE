"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/buttons/Button";
import { clearSession, logout } from "@/lib/auth";

export function LogoutButton() {
  const router = useRouter();

  //서버 요청이 실패해도 클라이언트 세션은 비워야 로그아웃된 것으로 보인다
  const handleClick = async () => {
    try {
      await logout();
    } finally {
      clearSession();
      router.replace("/login");
    }
  };

  return (
    <Button
      label="로그아웃"
      variant="outlined"
      color="secondary"
      onClick={handleClick}
    />
  );
}
