import type { Meta, StoryObj } from "@storybook/nextjs";
import { fn } from "storybook/test";

import { APP_FRAME_ID } from "./app-frame";
import { ConfirmModal } from "./ConfirmModal";

const meta = {
  title: "Overlays/ConfirmModal",
  component: ConfirmModal,
  parameters: {
    layout: "fullscreen",
  },
  // 모달은 앱 프레임으로 포털해 붙으므로 캔버스에도 프레임을 만들어 준다.
  decorators: [
    (Story) => (
      <div
        id={APP_FRAME_ID}
        className="relative h-[84.4rem] w-[39rem] overflow-hidden bg-white"
      >
        <Story />
      </div>
    ),
  ],
  args: {
    open: true,
    title: "정말 탈퇴할까요?",
    description: "모든 데이터가 삭제되며 복구할 수 없어요.",
    confirmLabel: "탈퇴하기",
    onConfirm: fn(),
    onClose: fn(),
  },
  argTypes: {
    open: { control: "boolean" },
    title: { control: "text" },
    description: { control: "text" },
    confirmLabel: { control: "text" },
    cancelLabel: { control: "text" },
    tone: { control: "inline-radio", options: ["critical", "primary"] },
    confirming: { control: "boolean" },
  },
} satisfies Meta<typeof ConfirmModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 되돌릴 수 없는 동작. 확인 버튼이 빨갛다. */
export const Critical: Story = {
  args: { tone: "critical" },
};

/** 되돌릴 수 있는 동작. */
export const Primary: Story = {
  args: {
    tone: "primary",
    title: "설정중인 라이브를 저장할까요?",
    description: undefined,
    confirmLabel: "저장하기",
  },
};

/** 요청 중에는 확인 버튼을 다시 누를 수 없다. */
export const Confirming: Story = {
  args: { tone: "critical", confirming: true },
};
