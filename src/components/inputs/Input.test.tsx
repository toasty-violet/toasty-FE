import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

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
