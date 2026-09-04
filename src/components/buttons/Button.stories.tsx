import type { Meta, StoryObj } from "@storybook/nextjs";
import { fn } from "storybook/test";

import { Button } from "./Button";

const meta = {
  title: "Buttons/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  args: {
    label: "텍스트",
    onClick: fn(),
  },
  argTypes: {
    label: { control: "text" },
    variant: { control: "inline-radio", options: ["solid", "outlined"] },
    color: {
      control: "inline-radio",
      options: ["primary", "secondary", "assistive"],
    },
    size: { control: "inline-radio", options: ["lg", "md", "sm"] },
    disabled: { control: "boolean" },
    type: { control: "inline-radio", options: ["button", "submit"] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Outlined: Story = {
  args: {
    variant: "outlined",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

const COLORS = ["primary", "secondary", "assistive"] as const;
const SIZES = ["lg", "md", "sm"] as const;

/** Solid 전체 조합. 같은 크기 기준으로 위가 일반, 아래가 disabled 상태입니다. */
export const SolidMatrix: Story = {
  render: (args) => (
    <div className="flex flex-col gap-20 p-20">
      {SIZES.map((size) => (
        <div key={size} className="flex flex-col gap-8">
          {[false, true].map((disabled) => (
            <div key={String(disabled)} className="flex items-center gap-8">
              {COLORS.map((color) => (
                <Button
                  {...args}
                  key={color}
                  color={color}
                  size={size}
                  disabled={disabled}
                />
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
};

/** Outlined 전체 조합. secondary는 디자인에 없어 assistive와 동일하게 렌더됩니다. */
export const OutlinedMatrix: Story = {
  args: {
    variant: "outlined",
  },
  render: (args) => (
    <div className="flex flex-col gap-20 p-20">
      {SIZES.map((size) => (
        <div key={size} className="flex flex-col gap-8">
          {[false, true].map((disabled) => (
            <div key={String(disabled)} className="flex items-center gap-8">
              {COLORS.map((color) => (
                <Button
                  {...args}
                  key={color}
                  color={color}
                  size={size}
                  disabled={disabled}
                />
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
};
