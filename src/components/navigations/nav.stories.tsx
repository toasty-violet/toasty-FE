import type { Meta, StoryObj } from "@storybook/nextjs";
import { usePathname } from "@storybook/nextjs/navigation.mock";
import { Fragment, useLayoutEffect, useState } from "react";

import { CustomerNav } from "./CustomerNav";
import { SellerNav } from "./SellerNav";

/** 두 네비게이션 모두 usePathname()으로 활성 탭을 정한다. */
const meta = {
  title: "Navigations/Nav",
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 실제 라우터가 없는 Storybook에서 탭 전환을 재현한다.
 * 링크 클릭을 가로채 usePathname 목의 반환값을 바꾸고, key로 강제 리마운트한다.
 */
function InteractiveNav({
  children,
  initialPathname,
}: {
  children: React.ReactNode;
  initialPathname: string;
}) {
  const [pathname, setPathname] = useState(initialPathname);

  // 스토리 파라미터가 매 렌더마다 목을 덮어쓰므로 렌더 직전에 다시 지정한다.
  useLayoutEffect(() => {
    usePathname.mockReturnValue(pathname);
  }, [pathname]);
  usePathname.mockReturnValue(pathname);

  return (
    <div
      onClickCapture={(event) => {
        const link = (event.target as HTMLElement).closest("a");
        if (!link) return;

        event.preventDefault();
        setPathname(new URL(link.href).pathname);
      }}
    >
      <Fragment key={pathname}>{children}</Fragment>
    </div>
  );
}

/** 탭을 눌러 활성 상태가 바뀌는 것을 확인할 수 있다. */
export const Customer: Story = {
  render: () => (
    <InteractiveNav initialPathname="/">
      <CustomerNav />
    </InteractiveNav>
  ),
};

/** 탭을 눌러 활성 상태가 바뀌는 것을 확인할 수 있다. */
export const Seller: Story = {
  render: () => (
    <InteractiveNav initialPathname="/live">
      <SellerNav />
    </InteractiveNav>
  ),
};
