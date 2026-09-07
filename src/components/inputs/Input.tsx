"use client";

import { useRef } from "react";

import {
  InputField,
  fieldBaseStyle,
  type InputFieldBaseProps,
} from "./InputField";

type InputProps = InputFieldBaseProps &
  Pick<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "inputMode" | "autoComplete"
  > & {
    /** 엔터를 눌렀을 때 현재 값과 함께 호출된다. */
    onSubmit?: (value: string) => void;
    /** 엔터를 누르면 포커스를 뗀다. */
    blurOnSubmit?: boolean;
  };

export function Input({
  type = "text",
  inputMode,
  autoComplete,
  onSubmit,
  blurOnSubmit = false,
  ...fieldProps
}: InputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    // 한글 입력 중의 엔터는 조합을 확정하는 키라서 무시한다.
    if (event.nativeEvent.isComposing) return;
    if (!onSubmit && !blurOnSubmit) return;

    // 폼 안에 있을 때 엔터로 제출되는 것을 막는다.
    event.preventDefault();
    onSubmit?.(fieldProps.value);
    if (blurOnSubmit) inputRef.current?.blur();
  };

  return (
    <InputField
      {...fieldProps}
      boxClassName="h-56 items-center px-16"
      focusField={() => inputRef.current?.focus()}
      renderAffix={({ clearButton, counter }) => (
        <>
          {clearButton}
          {counter}
        </>
      )}
    >
      {(control) => (
        <input
          {...control}
          ref={inputRef}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          onKeyDown={handleKeyDown}
          className={fieldBaseStyle}
        />
      )}
    </InputField>
  );
}
