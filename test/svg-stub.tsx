import type { SVGProps } from "react";

// Next(turbopack)/Storybook(webpack)은 @svgr/webpack으로 svg를 React 컴포넌트로
// 변환하지만 vitest에는 해당 로더가 없어, 테스트에서는 이 스텁으로 대체한다.
export default function SvgStub(props: SVGProps<SVGSVGElement>) {
  return <svg {...props} />;
}
