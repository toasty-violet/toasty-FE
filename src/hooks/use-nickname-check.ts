"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { fetchNicknameDuplicated, fetchShopNameDuplicated } from "@/lib/user";

export const NICKNAME_PATTERN = /^[가-힣a-zA-Z0-9]{2,20}$/;

const DEBOUNCE_MS = 500;

/**
 * 구매자 닉네임과 셀러 스토어 이름은 별개의 저장소로 관리한다.
 * 형식과 문구는 같으므로 다른 곳만 여기에 모아 둔다.
 */
const KIND = {
  nickname: {
    fetchDuplicated: fetchNicknameDuplicated,
    errorMessage: "이미 사용 중인 닉네임이에요.",
    successMessage: "사용 가능한 닉네임이에요.",
  },
  shopName: {
    fetchDuplicated: fetchShopNameDuplicated,
    errorMessage: "이미 사용 중인 스토어 이름이에요.",
    successMessage: "사용 가능한 스토어 이름이에요.",
  },
} as const;

export type NameKind = keyof typeof KIND;

/**
 * 이름의 형식 검증과 중복 조회를 합쳐 Input 이 그대로 받는 상태로 돌려준다.
 * 구매자 닉네임과 셀러 스토어 이름이 같은 규칙을 쓰므로 한곳에 둔다.
 *
 * @param kind 어느 이름 공간에 물어볼지. 서버가 둘을 갈라 보므로 반드시 맞춰 준다.
 * @param checkFromStart 처음부터 채워져 있던 값도 조회할지 여부.
 * 이미 제 것인 이름을 띄우는 화면은 false(기본), 아직 아무도 쓰지 않은
 * 초안이나 추천값을 채워 둔 화면은 true 로 둔다.
 */
export function useNicknameCheck(
  nickname: string,
  kind: NameKind = "nickname",
  checkFromStart = false,
) {
  const { fetchDuplicated, errorMessage, successMessage } = KIND[kind];

  const debounced = useDebouncedValue(nickname, DEBOUNCE_MS);

  // 이미 쓰던 닉네임을 채운 채 열리는 화면이 그대로 조회하지 않도록,
  // 이용자가 실제로 고친 뒤부터 묻는다.
  const [initial] = useState(nickname);
  const edited = checkFromStart || nickname !== initial;

  // 형식이 틀린 값은 서버에 물어볼 필요가 없다.
  const malformed = nickname !== "" && !NICKNAME_PATTERN.test(nickname);
  const canSearch = edited && NICKNAME_PATTERN.test(debounced);

  // 같은 값이라도 이름 공간이 다르면 답이 다르므로 kind 까지 키에 넣는다.
  const { data: duplicated, isSuccess } = useQuery({
    queryKey: ["name-duplication", kind, debounced],
    queryFn: () => fetchDuplicated(debounced),
    enabled: canSearch,
  });

  // 타이핑 중에는 debounced 가 아직 이전 값이라, 조회 결과를 현재 입력의 답으로 쓰면 안 된다.
  const settled = isSuccess && debounced === nickname;

  return {
    error: malformed || (settled && duplicated === true),
    errorMessage: malformed
      ? "한글, 영문, 숫자 2~20자로 입력해 주세요."
      : errorMessage,
    success: settled && duplicated === false,
    successMessage,
    /** 중복 조회까지 통과해야 제출할 수 있다. */
    verified: settled && duplicated === false,
  };
}
