import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";
import { fn } from "storybook/test";

import { PostalInput, type PostalValue } from "./PostalInput";

const emptyValue: PostalValue = {
  postalCode: "",
  roadAddress: "",
  jibunAddress: "",
  addressType: "",
  buildingName: "",
  legalDong: "",
  detailAddress: "",
};

const filledValue: PostalValue = {
  postalCode: "06236",
  roadAddress: "서울 강남구 테헤란로 152",
  jibunAddress: "서울 강남구 역삼동 737",
  addressType: "R",
  buildingName: "강남파이낸스센터",
  legalDong: "역삼동",
  detailAddress: "10층 1001호",
};

const meta = {
  title: "Inputs/PostalInput",
  component: PostalInput,
  parameters: {
    layout: "centered",
  },
  args: {
    value: emptyValue,
    onChange: fn(),
    title: "배송지",
  },
  argTypes: {
    title: { control: "text" },
    disabled: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div className="w-[34.8rem]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PostalInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 우편번호 찾기를 눌러 실제 카카오 우편번호 검색을 사용할 수 있습니다. */
function ControlledPostalInput(args: React.ComponentProps<typeof PostalInput>) {
  const [value, setValue] = useState(args.value);

  return (
    <PostalInput
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
  render: (args) => <ControlledPostalInput {...args} />,
};

export const Filled: Story = {
  args: {
    value: filledValue,
  },
  render: (args) => <ControlledPostalInput {...args} />,
};

/** 지번 주소를 선택하면 참고항목 없이 지번 주소만 노출됩니다. */
export const JibunSelected: Story = {
  args: {
    value: { ...filledValue, addressType: "J" },
  },
  render: (args) => <ControlledPostalInput {...args} />,
};

export const Disabled: Story = {
  args: {
    value: filledValue,
    disabled: true,
  },
  render: (args) => <ControlledPostalInput {...args} />,
};
