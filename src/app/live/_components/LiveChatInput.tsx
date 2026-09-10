"use client";

import { useState, type FormEvent } from "react";

// tokens.json 이 낡아 CSS 변수로 못 쓰는 색이다. Figma 실제 값을 직접 적는다.
const BORDER = "#ffffff73"; // stroke/neutral-inverse-muted

/** 채팅 입력줄. 비로그인과 끝난 방송에서는 잠긴다. */
export function LiveChatInput({
  disabled = false,
  onSend,
}: {
  disabled?: boolean;
  /** 보내지 못했으면 false 를 준다. 그때는 적은 글을 지우지 않는다. */
  onSend: (text: string) => Promise<boolean>;
}) {
  const [text, setText] = useState("");
  const trimmed = text.trim();

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!trimmed) return;
    if (await onSend(trimmed)) setText("");
  }

  return (
    <form
      onSubmit={submit}
      style={{ borderColor: BORDER }}
      className="flex h-[4.4rem] w-full items-center gap-12 rounded-full border px-16"
    >
      <input
        value={text}
        onChange={(event) => setText(event.target.value)}
        disabled={disabled}
        placeholder="댓글 달기..."
        aria-label="채팅 입력"
        className="text-b3-regular text-fg-neutral-inverted placeholder:text-fg-neutral-inverted min-w-0 flex-1 bg-transparent outline-none"
      />
      {trimmed && (
        <button
          type="submit"
          className="text-l3-semibold text-fg-neutral-inverted shrink-0"
        >
          전송
        </button>
      )}
    </form>
  );
}
