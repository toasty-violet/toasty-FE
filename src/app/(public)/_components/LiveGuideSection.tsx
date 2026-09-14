import Image from "next/image";

import { Slider, SliderItem } from "@/components/sliders/Slider";

const GUIDES = [
  { src: "/images/LiveGuide1.png", alt: "가입하고 계좌만 등록하면 준비 끝!" },
  { src: "/images/LiveGuide2.png", alt: "라이브 보다가 마음에 들면 바로 구매" },
  { src: "/images/LiveGuide3.png", alt: "놓친 상품도 구매할 수 있어요" },
] as const;

/** 토스티 라이브 가이드 배너 3장. 가로로 넘겨 본다. */
export function LiveGuideSection() {
  return (
    <Slider edgePadding={20} aria-label="토스티 라이브 가이드">
      {GUIDES.map(({ src, alt }) => (
        <SliderItem key={src}>
          <Image
            src={src}
            alt={alt}
            width={512}
            height={512}
            className="rounded-12 size-[15.6rem] object-cover"
          />
        </SliderItem>
      ))}
    </Slider>
  );
}
