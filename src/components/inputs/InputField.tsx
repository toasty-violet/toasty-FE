"use client";

import { useId, useState, type ReactNode } from "react";

import DeleteIcon from "@/assets/Delete.svg";

export type InputFieldBaseProps = {
  value: string;
  onChange: (value: string) => void;
  title?: string;
  placeholder?: string;
  message?: string;
  errorMessage?: string;
  error?: boolean;
  maxLetter?: number;
  disabled?: boolean;
  name?: string;
};

/** Input/Textarea가 공유하는, 실제 입력 요소에 그대로 넘기는 속성. */
export type FieldControlProps = {
  id: string;
  name?: string;
  value: string;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onFocus: () => void;
  onBlur: () => void;
  "aria-invalid": boolean;
  "aria-describedby"?: string;
};

type InputFieldProps = InputFieldBaseProps & {
  /** 입력 요소를 렌더한다. control을 그대로 input/textarea에 펼쳐 넣는다. */
  children: (control: FieldControlProps) => ReactNode;
  /** 테두리 박스에 덧붙일 레이아웃 스타일. */
  boxClassName: string;
  /** 지우기 버튼과 글자 수 카운터의 배치. */
  renderAffix: (affix: {
    clearButton: ReactNode;
    counter: ReactNode;
  }) => ReactNode;
  /** 지우기 버튼을 누른 뒤 포커스를 되돌릴 대상. */
  focusField: () => void;
};

const boxBaseStyle =
  "flex w-full gap-8 rounded-12 border transition-colors bg-bg-layer-default";

export const fieldBaseStyle =
  "min-w-0 flex-1 bg-transparent outline-none text-b1-regular text-fg-neutral-solid placeholder:text-fg-neutral-placeholder disabled:text-fg-neutral-placeholder";

export function InputField({
  value,
  onChange,
  title,
  placeholder = "텍스트를 입력해 주세요.",
  message,
  errorMessage,
  error = false,
  maxLetter,
  disabled = false,
  name,
  children,
  boxClassName,
  renderAffix,
  focusField,
}: InputFieldProps) {
  const id = useId();
  const [focused, setFocused] = useState(false);

  const description = error ? errorMessage : message;
  const showClear = !disabled && value.length > 0;

  //조건에 맞지 않는 값일 경우 붉은 테두리
  const borderStyle = error
    ? "border-[0.15rem] border-stroke-critical-solid"
    : focused
      ? "border-[0.15rem] border-stroke-neutral-solid bg-bg-layer-default-pressed"
      : "border-stroke-neutral-weak";

  const handleChange = (nextValue: string) => {
    // maxLength만으로는 붙여넣기/IME 조합 결과가 초과될 수 있어 값 자체를 자른다.
    onChange(
      maxLetter !== undefined ? nextValue.slice(0, maxLetter) : nextValue,
    );
  };

  //x 버튼을 누르면 입력창이 초기화 된다.
  const handleClear = () => {
    onChange("");
    focusField();
  };

  const control: FieldControlProps = {
    id,
    name,
    value,
    placeholder,
    disabled,
    maxLength: maxLetter,
    onChange: (event) => handleChange(event.target.value),
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    "aria-invalid": error,
    "aria-describedby": description ? `${id}-description` : undefined,
  };

  const counter = maxLetter !== undefined && (
    <span className="text-c2-medium text-fg-neutral-placeholder shrink-0 text-center">
      {value.length}/{maxLetter}
    </span>
  );

  const clearButton = showClear && (
    <button
      type="button"
      onClick={handleClear}
      aria-label="입력값 지우기"
      className="shrink-0"
    >
      <DeleteIcon className="size-24" />
    </button>
  );

  return (
    <div className="flex h-fit w-full flex-col gap-8">
      {title && (
        <label htmlFor={id} className="text-l4-medium text-fg-neutral-strong">
          {title}
        </label>
      )}

      <div
        className={`${boxBaseStyle} ${boxClassName} ${borderStyle} ${
          disabled ? "bg-bg-neutral-weak" : ""
        }`}
      >
        {children(control)}
        {renderAffix({ clearButton, counter })}
      </div>

      {description && (
        <p
          id={`${id}-description`}
          className={`text-c1-medium ${error ? "text-fg-critical" : "text-fg-neutral-placeholder"}`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
