import type { Meta, StoryObj } from "@storybook/nextjs";
import { fn } from "storybook/test";

import { BottomButton } from "./BottomButton";

const meta = {
  title: "Buttons/BottomButton",
  component: BottomButton,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    label: "텍스트",
    onClick: fn(),
  },
  argTypes: {
    label: { control: "text" },
    disabled: { control: "boolean" },
    type: { control: "inline-radio", options: ["button", "submit"] },
  },
} satisfies Meta<typeof BottomButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const LongLabel: Story = {
  args: {
    label: "긴 레이블이 들어가는 경우의 버튼입니다",
  },
};
