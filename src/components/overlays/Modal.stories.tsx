import type { Meta, StoryObj } from "@storybook/nextjs";
import { fn } from "storybook/test";

import { APP_FRAME_ID } from "./app-frame";
import { Modal } from "./Modal";

const meta = {
  title: "Overlays/Modal",
  component: Modal,
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
    onClose: fn(),
  },
  argTypes: {
    open: { control: "boolean" },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 껍데기만 있고 내용은 쓰는 쪽이 채운다. */
export const Default: Story = {
  args: {
    children: (
      <p className="text-b3-regular text-fg-neutral-primary text-center">
        내용은 children 으로 채웁니다.
      </p>
    ),
  },
};
