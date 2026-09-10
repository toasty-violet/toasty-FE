"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChatRoom, SendMessageRequest } from "amazon-ivs-chat-messaging";

import { ApiRequestError } from "@/lib/api-error";
import { LIVE_ERROR_CODE, type ChatRole } from "@/types/live";

import { issueChatToken } from "./live-api";

// BE 의 ivs.region 과 같아야 한다. 서버가 리터럴로 두고 있어 여기도 상수로 둔다.
const REGION = "ap-northeast-2";

// 오래된 메시지는 화면 밖으로 밀려나 다시 보이지 않는다. 무한정 쌓지 않는다.
const MAX_MESSAGES = 100;

export interface ChatMessageView {
  id: string;
  content: string;
  role: ChatRole;
  /** 비로그인은 서버가 이름을 싣지 않는다. */
  displayName: string;
}

function toView(
  id: string,
  content: string,
  attributes: Record<string, string> | undefined,
): ChatMessageView {
  const role = attributes?.role;
  return {
    id,
    content,
    role:
      role === "SELLER" || role === "CUSTOMER" ? (role as ChatRole) : "GUEST",
    displayName: attributes?.displayName ?? "익명",
  };
}

/**
 * 라이브 채팅방에 붙어 메시지를 받고 보낸다. 셀러 송출과 구매자 시청이 함께 쓴다.
 * 방송한 적 없는 라이브는 채팅방이 없어 `unavailable` 로 돌아온다.
 */
export function useLiveChat({
  publicId,
  enabled,
}: {
  publicId: string;
  enabled: boolean;
}) {
  const [messages, setMessages] = useState<ChatMessageView[]>([]);
  const [writable, setWritable] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const roomRef = useRef<ChatRoom | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let room: ChatRoom | undefined;

    async function connect() {
      let first;
      try {
        first = await issueChatToken(publicId);
      } catch (error) {
        if (
          error instanceof ApiRequestError &&
          error.code === LIVE_ERROR_CODE.CHAT_ROOM_NOT_FOUND
        ) {
          if (!cancelled) setUnavailable(true);
        }
        return;
      }
      if (cancelled) return;

      setWritable(first.writable);

      // 첫 토큰은 이미 받아 뒀다. 세션이 끝날 무렵 SDK 가 이 함수를 다시 부른다.
      let issued = false;
      room = new ChatRoom({
        regionOrUrl: REGION,
        tokenProvider: async () => {
          const token = issued ? await issueChatToken(publicId) : first;
          issued = true;
          setWritable(token.writable);
          // SDK 는 tokenExpirationTime 만 보고 재연결 시점을 잡는다.
          // 우리가 지켜야 하는 건 세션 만료라 그 값을 여기에 싣는다.
          return {
            token: token.token,
            tokenExpirationTime: new Date(token.expiresAt),
          };
        },
      });
      roomRef.current = room;

      room.addListener("message", (message) => {
        setMessages((prev) =>
          [
            ...prev,
            toView(message.id, message.content, message.sender.attributes),
          ].slice(-MAX_MESSAGES),
        );
      });

      room.connect();
    }

    connect();

    return () => {
      cancelled = true;
      room?.disconnect();
      roomRef.current = null;
    };
  }, [publicId, enabled]);

  const send = useCallback(async (content: string) => {
    const room = roomRef.current;
    if (!room) return;
    await room.sendMessage(new SendMessageRequest(content));
  }, []);

  return { messages, writable, unavailable, send };
}
