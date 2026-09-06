import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { Input } from "./Input";
import { Textarea } from "./Textarea";

function InputHarness(props: Partial<React.ComponentProps<typeof Input>>) {
  const [value, setValue] = useState("");
  return <Input value={value} onChange={setValue} title="주제" {...props} />;
}

function TextareaHarness(
  props: Partial<React.ComponentProps<typeof Textarea>>,
) {
  const [value, setValue] = useState("");
  return <Textarea value={value} onChange={setValue} title="주제" {...props} />;
}

describe("Input", () => {
  it("maxLetter를 넘으면 더 이상 입력되지 않는다", async () => {
    const user = userEvent.setup();
    render(<InputHarness maxLetter={5} />);
    const field = screen.getByLabelText("주제");

    await user.type(field, "1234567890");

    expect(field).toHaveValue("12345");
  });

  it("붙여넣기로도 maxLetter를 넘지 않는다", async () => {
    const user = userEvent.setup();
    render(<InputHarness maxLetter={5} />);
    const field = screen.getByLabelText("주제");

    await user.click(field);
    await user.paste("1234567890");

    expect(field).toHaveValue("12345");
  });

  it("값이 있으면 지우기 버튼이 뜨고, 누르면 초기화된다", async () => {
    const user = userEvent.setup();
    render(<InputHarness />);
    const field = screen.getByLabelText("주제");

    expect(screen.queryByRole("button", { name: "입력값 지우기" })).toBeNull();

    await user.type(field, "안녕");
    await user.click(screen.getByRole("button", { name: "입력값 지우기" }));

    expect(field).toHaveValue("");
    expect(field).toHaveFocus();
  });

  it("disabled 상태에서는 값을 입력할 수 없다", async () => {
    const user = userEvent.setup();
    render(<InputHarness disabled />);
    const field = screen.getByLabelText("주제");

    await user.type(field, "안녕");

    expect(field).toHaveValue("");
    expect(screen.queryByRole("button", { name: "입력값 지우기" })).toBeNull();
  });

  it("error일 때 errorMessage를 대신 보여준다", () => {
    render(<InputHarness error message="가이드" errorMessage="에러 문구" />);

    expect(screen.getByText("에러 문구")).toBeInTheDocument();
    expect(screen.queryByText("가이드")).toBeNull();
    expect(screen.getByLabelText("주제")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("엔터를 누르면 onSubmit에 현재 값을 넘긴다", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<InputHarness onSubmit={onSubmit} />);
    const field = screen.getByLabelText("주제");

    await user.type(field, "안녕{Enter}");

    expect(onSubmit).toHaveBeenCalledExactlyOnceWith("안녕");
    expect(field).toHaveValue("안녕");
  });

  it("blurOnSubmit이면 엔터로 포커스가 풀린다", async () => {
    const user = userEvent.setup();
    render(<InputHarness blurOnSubmit />);
    const field = screen.getByLabelText("주제");

    await user.type(field, "안녕");
    expect(field).toHaveFocus();

    await user.keyboard("{Enter}");

    expect(field).not.toHaveFocus();
    expect(field).toHaveValue("안녕");
  });

  it("한글 조합 중의 엔터는 무시한다", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<InputHarness onSubmit={onSubmit} blurOnSubmit />);
    const field = screen.getByLabelText("주제");

    await user.click(field);

    // IME 조합 확정용 엔터는 isComposing이 true로 들어온다.
    // 읽기 전용 getter라 defineProperty로 덮어써야 한다.
    const event = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(event, "isComposing", { value: true });
    field.dispatchEvent(event);

    expect(onSubmit).not.toHaveBeenCalled();
    expect(field).toHaveFocus();
  });

  it("onSubmit도 blurOnSubmit도 없으면 엔터를 가로채지 않는다", async () => {
    const user = userEvent.setup();
    const onFormSubmit = vi.fn((event: React.FormEvent) =>
      event.preventDefault(),
    );
    render(
      <form onSubmit={onFormSubmit}>
        <InputHarness />
      </form>,
    );

    await user.type(screen.getByLabelText("주제"), "안녕{Enter}");

    expect(onFormSubmit).toHaveBeenCalledOnce();
  });

  it("input 고유 속성을 전달한다", () => {
    render(
      <InputHarness type="email" inputMode="email" autoComplete="email" />,
    );
    const field = screen.getByLabelText("주제");

    expect(field).toHaveAttribute("type", "email");
    expect(field).toHaveAttribute("inputmode", "email");
    expect(field).toHaveAttribute("autocomplete", "email");
  });
});

describe("Textarea", () => {
  it("textarea로 렌더된다", () => {
    render(<TextareaHarness />);

    expect(screen.getByLabelText("주제").tagName).toBe("TEXTAREA");
  });

  it("maxLetter를 넘으면 더 이상 입력되지 않는다", async () => {
    const user = userEvent.setup();
    render(<TextareaHarness maxLetter={5} />);
    const field = screen.getByLabelText("주제");

    await user.type(field, "1234567890");

    expect(field).toHaveValue("12345");
  });

  it("지우기 버튼을 누르면 초기화된다", async () => {
    const user = userEvent.setup();
    render(<TextareaHarness />);
    const field = screen.getByLabelText("주제");

    await user.type(field, "안녕");
    await user.click(screen.getByRole("button", { name: "입력값 지우기" }));

    expect(field).toHaveValue("");
    expect(field).toHaveFocus();
  });

  it("rows를 전달한다", () => {
    render(<TextareaHarness rows={5} />);

    expect(screen.getByLabelText("주제")).toHaveAttribute("rows", "5");
  });

  it("error일 때 errorMessage를 대신 보여준다", () => {
    render(<TextareaHarness error message="가이드" errorMessage="에러 문구" />);

    expect(screen.getByText("에러 문구")).toBeInTheDocument();
    expect(screen.queryByText("가이드")).toBeNull();
  });
});
