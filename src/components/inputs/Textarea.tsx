"use client";

import { useLayoutEffect, useRef } from "react";

import {
  InputField,
  fieldBaseStyle,
  type InputFieldBaseProps,
} from "./InputField";

type TextareaProps = InputFieldBaseProps & {
  rows?: number;
  /** 입력 길이에 맞춰 높이를 늘린다. */
  autoResize?: boolean;
};

export function Textarea({
  rows = 2,
  autoResize = false,
  ...fieldProps
}: TextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { value } = fieldProps;

  useLayoutEffect(() => {
    if (!autoResize) return;

    const textarea = textareaRef.current;
    if (!textarea) return;

    // scrollHeight를 다시 재려면 먼저 높이를 비워야 한다.
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [autoResize, value]);

  return (
    <InputField
      {...fieldProps}
      boxClassName="flex-col justify-center px-16 py-14"
      focusField={() => textareaRef.current?.focus()}
      renderAffix={({ clearButton, counter }) => (
        <div className="flex w-full items-center justify-end gap-8">
          {clearButton}
          {counter}
        </div>
      )}
    >
      {(control) => (
        <textarea
          {...control}
          ref={textareaRef}
          rows={rows}
          className={`${fieldBaseStyle} min-h-52 w-full resize-none leading-[1.6] ${
            autoResize ? "overflow-hidden" : ""
          }`}
        />
      )}
    </InputField>
  );
}
