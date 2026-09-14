import type { Meta, StoryObj } from "@storybook/nextjs";
import { fn } from "storybook/test";

import { StoreTop3Item, StoreTop3ItemSkeleton } from "./StoreTop3Item";

const meta = {
  title: "Home/StoreTop3Item",
  component: StoreTop3Item,
  parameters: {
    layout: "padded",
  },
  args: {
    store: {
      sellerId: 1,
      shopName: "데일리 빈티지",
      shopImageUrl: "",
      followerCount: 1240,
      productCount: 98,
      following: false,
    },
    onToggleFollow: fn(),
  },
  // 실제 섹션과 같은 ul 안에서 봐야 간격과 정렬이 맞는지 확인할 수 있다.
  decorators: [
    (Story) => (
      <ul className="flex w-full flex-col gap-24 px-20">
        <Story />
      </ul>
    ),
  ],
} satisfies Meta<typeof StoreTop3Item>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 아직 팔로우하지 않은 스토어. 사진이 없어 기본 이미지가 보입니다. */
export const Default: Story = {};

/** 이미 팔로우 중이라 버튼이 Outlined "팔로잉" 으로 바뀝니다. */
export const Following: Story = {
  args: {
    store: {
      sellerId: 2,
      shopName: "heart.vtg",
      shopImageUrl: "",
      followerCount: 840,
      productCount: 76,
      following: true,
    },
  },
};

/** 이름이 길면 말줄임 처리되고 버튼은 밀리지 않습니다. */
export const LongName: Story = {
  args: {
    store: {
      sellerId: 3,
      shopName: "아주 긴 이름을 가진 빈티지 편집샵 스토어입니다",
      shopImageUrl: "",
      followerCount: 128450,
      productCount: 1203,
      following: false,
    },
  },
};

/** 데이터를 불러오는 동안 자리를 잡아 두는 스켈레톤 3줄입니다. */
export const Skeleton: StoryObj = {
  render: () => (
    <>
      <StoreTop3ItemSkeleton />
      <StoreTop3ItemSkeleton />
      <StoreTop3ItemSkeleton />
    </>
  ),
};

/** 스켈레톤에서 실제 목록으로 넘어갔을 때 높이가 맞는지 비교합니다. */
export const SkeletonAndLoaded: StoryObj = {
  render: () => (
    <>
      <StoreTop3ItemSkeleton />
      <StoreTop3Item
        store={{
          sellerId: 1,
          shopName: "데일리 빈티지",
          shopImageUrl: "",
          followerCount: 1240,
          productCount: 98,
          following: false,
        }}
        onToggleFollow={fn()}
      />
    </>
  ),
};
