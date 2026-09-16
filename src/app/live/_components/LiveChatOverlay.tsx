"use client";

import { useEffect, useRef } from "react";

import type { ChatMessageView } from "@/app/live/_lib/use-live-chat";

// tokens.json 이 낡아 CSS 변수로 못 쓰는 색이다. Figma 실제 값을 직접 적는다.
const SELLER = "#fdae9b"; // fg/brand-weak

// 위로 밀려난 메시지는 흐려지며 사라진다.
const FADE = "linear-gradient(to bottom, transparent 0%, black 30%)";

// 이만큼 안쪽이면 바닥에 붙어 있는 것으로 본다.
const STICK_THRESHOLD_PX = 24;

/**
 * 비디오 위에 얹히는 채팅. 최신 메시지가 아래에 쌓이고 지난 메시지는 올려서 볼 수 있다.
 * 셀러 말은 색으로 구분한다.
 */
export function LiveChatOverlay({ messages }: { messages: ChatMessageView[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // 지난 메시지를 보는 중에 새 메시지가 오면 끌어내리지 않는다.
  const stuckToBottom = useRef(true);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller || !stuckToBottom.current) return;

    scroller.scrollTop = scroller.scrollHeight;
  }, [messages]);

  return (
    <div
      ref={scrollRef}
      onScroll={(event) => {
        const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
        stuckToBottom.current =
          scrollHeight - scrollTop - clientHeight <= STICK_THRESHOLD_PX;
      }}
      className="scrollbar-hidden h-[16rem] w-full overflow-y-auto overscroll-contain"
      style={{ maskImage: FADE, WebkitMaskImage: FADE }}
    >
      {/* 메시지가 적으면 아래에 붙고, 넘치면 위로 자라 스크롤된다. */}
      <ul
        aria-live="polite"
        className="flex min-h-full w-full flex-col justify-end gap-8"
      >
        {messages.map((message) => (
          <li
            key={message.id}
            // 이름을 글줄에 태워야 긴 메시지가 이름 아래로 감긴다.
            className="text-b4-regular text-fg-neutral-inverted w-full"
            style={message.role === "SELLER" ? { color: SELLER } : undefined}
          >
            <span className="text-l4-semibold mr-6">{message.displayName}</span>
            {message.content}
          </li>
        ))}
      </ul>
    </div>
  );
}
