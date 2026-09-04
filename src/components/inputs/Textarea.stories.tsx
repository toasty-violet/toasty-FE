import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";
import { fn } from "storybook/test";

import { Textarea } from "./Textarea";

const meta = {
  title: "Inputs/Textarea",
  component: Textarea,
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
    rows: { control: "number" },
    autoResize: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div className="w-[34.8rem]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 값을 실제로 입력해 볼 수 있는 상태 연결 래퍼입니다. */
function ControlledTextarea(args: React.ComponentProps<typeof Textarea>) {
  const [value, setValue] = useState(args.value);

  return (
    <Textarea
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
  render: (args) => <ControlledTextarea {...args} />,
};

export const Filled: Story = {
  args: {
    value: "입력값",
  },
  render: (args) => <ControlledTextarea {...args} />,
};

export const Error: Story = {
  args: {
    value: "입력값",
    error: true,
    errorMessage: "에러 텍스트 입력",
  },
  render: (args) => <ControlledTextarea {...args} />,
};

export const Disabled: Story = {
  args: {
    value: "입력값",
    disabled: true,
  },
  render: (args) => <ControlledTextarea {...args} />,
};

/** autoResize를 켜면 입력 길이에 맞춰 높이가 늘어납니다. */
export const AutoResize: Story = {
  args: {
    autoResize: true,
    message: "입력할수록 높이가 늘어납니다.",
  },
  render: (args) => <ControlledTextarea {...args} />,
};
