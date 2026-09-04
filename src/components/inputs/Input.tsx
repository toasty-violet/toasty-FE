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
  >;

export function Input({
  type = "text",
  inputMode,
  autoComplete,
  ...fieldProps
}: InputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

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
          className={fieldBaseStyle}
        />
      )}
    </InputField>
  );
}
