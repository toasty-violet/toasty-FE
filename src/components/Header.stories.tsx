import type { Meta, StoryObj } from "@storybook/nextjs";
import { fn } from "storybook/test";

import { Header } from "./Header";
import MoreIcon from "@/assets/More.svg";
import SearchIcon from "@/assets/Search.svg";
import ShareIcon from "@/assets/Share.svg";

const meta = {
  title: "Components/Header",
  component: Header,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    title: "화면 이름",
    onRightClick: fn(),
  },
  argTypes: {
    title: { control: "text" },
    showBack: { control: "boolean" },
    rightLabel: { control: "text" },
    rightIcon: { control: false },
  },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithRightIcon: Story = {
  args: {
    rightIcon: MoreIcon,
    rightLabel: "더보기",
  },
};

export const WithoutBack: Story = {
  args: {
    showBack: false,
  },
};

/** 제목이 길어져도 좌우 버튼과 무관하게 정중앙에 유지됩니다. */
export const LongTitle: Story = {
  args: {
    title: "아주 긴 화면 이름이 들어간 경우",
    rightIcon: ShareIcon,
    rightLabel: "공유하기",
  },
};

/** 우측 아이콘을 바꿔 끼우는 예시입니다. */
export const RightIconVariants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-8">
      <Header {...args} rightIcon={MoreIcon} rightLabel="더보기" />
      <Header {...args} rightIcon={SearchIcon} rightLabel="검색" />
      <Header {...args} rightIcon={ShareIcon} rightLabel="공유하기" />
    </div>
  ),
};
