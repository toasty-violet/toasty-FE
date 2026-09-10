"use client";

import type { ChatMessageView } from "@/app/live/_lib/use-live-chat";

// tokens.json 이 낡아 CSS 변수로 못 쓰는 색이다. Figma 실제 값을 직접 적는다.
const SELLER = "#fdae9b"; // fg/brand-weak

// 위로 밀려난 메시지는 흐려지며 사라진다.
const FADE = "linear-gradient(to bottom, transparent 0%, black 30%)";

/** 비디오 위에 얹히는 채팅. 최신 메시지가 아래에 쌓인다. 셀러 말은 색으로 구분한다. */
export function LiveChatOverlay({ messages }: { messages: ChatMessageView[] }) {
  return (
    <ul
      aria-live="polite"
      className="flex h-[16rem] w-full flex-col justify-end gap-8 overflow-hidden"
      style={{ maskImage: FADE, WebkitMaskImage: FADE }}
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
  );
}
