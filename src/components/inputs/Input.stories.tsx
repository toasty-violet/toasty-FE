import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";
import { fn } from "storybook/test";

import { Input } from "./Input";

const meta = {
  title: "Inputs/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  args: {
    value: "",
    onChange: fn(),
    title: "주제",
    placeholder: "텍스트를 입력해 주세요.",
    message: "가이드 텍스트 입력",
    maxLetter: 200,
  },
  argTypes: {
    value: { control: "text" },
    title: { control: "text" },
    placeholder: { control: "text" },
    message: { control: "text" },
    errorMessage: { control: "text" },
    error: { control: "boolean" },
    maxLetter: { control: "number" },
    disabled: { control: "boolean" },
    type: { control: "inline-radio", options: ["text", "email", "password"] },
  },
  decorators: [
    (Story) => (
      <div className="w-[34.8rem]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 값을 실제로 입력해 볼 수 있는 상태 연결 래퍼입니다. */
function ControlledInput(args: React.ComponentProps<typeof Input>) {
  const [value, setValue] = useState(args.value);

  return (
    <Input
      {...args}
      value={value}
      onChange={(next) => {
        setValue(next);
        args.onChange(next);
      }}
    />
  );
}

export const Default: Story = {
  render: (args) => <ControlledInput {...args} />,
};

export const Filled: Story = {
  args: {
    value: "입력값",
  },
  render: (args) => <ControlledInput {...args} />,
};

export const Error: Story = {
  args: {
    value: "입력값",
    error: true,
    errorMessage: "에러 텍스트 입력",
  },
  render: (args) => <ControlledInput {...args} />,
};

export const Disabled: Story = {
  args: {
    value: "입력값",
    disabled: true,
  },
  render: (args) => <ControlledInput {...args} />,
};

/** maxLetter에 도달하면 더 이상 입력되지 않습니다. */
export const MaxLetterReached: Story = {
  args: {
    value: "다섯글자",
    maxLetter: 5,
    message: "최대 5자까지 입력할 수 있어요.",
  },
  render: (args) => <ControlledInput {...args} />,
};

/** type/inputMode/autoComplete 같은 input 고유 속성을 넘길 수 있습니다. */
export const Email: Story = {
  args: {
    title: "이메일",
    placeholder: "example@toasty.com",
    message: "로그인에 사용할 이메일을 입력해 주세요.",
    maxLetter: undefined,
    type: "email",
    inputMode: "email",
    autoComplete: "email",
  },
  render: (args) => <ControlledInput {...args} />,
};
