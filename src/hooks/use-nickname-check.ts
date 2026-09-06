"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { fetchNicknameDuplicated } from "@/lib/user";

export const NICKNAME_PATTERN = /^[가-힣a-zA-Z0-9]{2,20}$/;

const DEBOUNCE_MS = 500;

/**
 * 닉네임의 형식 검증과 중복 조회를 합쳐 Input 이 그대로 받는 상태로 돌려준다.
 * 구매자·판매자 온보딩이 같은 규칙을 쓰므로 한곳에 둔다.
 */
export function useNicknameCheck(nickname: string) {
  const debounced = useDebouncedValue(nickname, DEBOUNCE_MS);

  // 이미 쓰던 닉네임을 채운 채 열리는 화면이 그대로 조회하지 않도록,
  // 이용자가 실제로 고친 뒤부터 묻는다.
  const [initial] = useState(nickname);
  const edited = nickname !== initial;

  // 형식이 틀린 값은 서버에 물어볼 필요가 없다.
  const malformed = nickname !== "" && !NICKNAME_PATTERN.test(nickname);
  const canSearch = edited && NICKNAME_PATTERN.test(debounced);

  const { data: duplicated, isSuccess } = useQuery({
    queryKey: ["nickname-duplication", debounced],
    queryFn: () => fetchNicknameDuplicated(debounced),
    enabled: canSearch,
  });

  // 타이핑 중에는 debounced 가 아직 이전 값이라, 조회 결과를 현재 입력의 답으로 쓰면 안 된다.
  const settled = isSuccess && debounced === nickname;

  return {
    error: malformed || (settled && duplicated === true),
    errorMessage: malformed
      ? "한글, 영문, 숫자 2~20자로 입력해 주세요."
      : "이미 사용 중인 닉네임이에요.",
    success: settled && duplicated === false,
    successMessage: "사용 가능한 닉네임이에요.",
    /** 중복 조회까지 통과해야 제출할 수 있다. */
    verified: settled && duplicated === false,
  };
}
