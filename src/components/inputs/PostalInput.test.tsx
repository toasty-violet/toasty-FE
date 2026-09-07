import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { PostalInput, type PostalValue } from "./PostalInput";

const EMPTY: PostalValue = {
  postalCode: "",
  roadAddress: "",
  jibunAddress: "",
  addressType: "",
  buildingName: "",
  legalDong: "",
  detailAddress: "",
};

function PostalHarness({ initial = EMPTY }: { initial?: PostalValue }) {
  const [value, setValue] = useState(initial);
  return <PostalInput value={value} onChange={setValue} />;
}

const getDetailField = () => screen.getByPlaceholderText("상세 주소");

describe("PostalInput", () => {
  it("상세 주소에서 엔터를 치면 포커스가 해제되고 값은 남는다", async () => {
    const user = userEvent.setup();
    render(<PostalHarness />);
    const field = getDetailField();

    await user.type(field, "10층 1001호");
    expect(field).toHaveFocus();

    await user.keyboard("{Enter}");

    expect(field).not.toHaveFocus();
    expect(field).toHaveValue("10층 1001호");
  });

  it("우편번호와 주소 칸은 직접 수정할 수 없다", async () => {
    const user = userEvent.setup();
    render(<PostalHarness />);
    const postcode = screen.getByPlaceholderText("우편번호");

    await user.type(postcode, "06236");

    expect(postcode).toBeDisabled();
    expect(postcode).toHaveValue("");
    expect(screen.getByPlaceholderText("주소")).toBeDisabled();
  });

  it("도로명을 고르면 참고항목을 괄호로 덧붙여 보여준다", () => {
    render(
      <PostalHarness
        initial={{
          ...EMPTY,
          postalCode: "06236",
          roadAddress: "서울 강남구 테헤란로 152",
          jibunAddress: "서울 강남구 역삼동 737",
          addressType: "R",
          legalDong: "역삼동",
          buildingName: "강남파이낸스센터",
        }}
      />,
    );

    expect(screen.getByPlaceholderText("주소")).toHaveValue(
      "서울 강남구 테헤란로 152 (역삼동, 강남파이낸스센터)",
    );
  });

  it("지번을 고르면 참고항목 없이 지번 주소만 보여준다", () => {
    render(
      <PostalHarness
        initial={{
          ...EMPTY,
          postalCode: "06236",
          roadAddress: "서울 강남구 테헤란로 152",
          jibunAddress: "서울 강남구 역삼동 737",
          addressType: "J",
          legalDong: "역삼동",
          buildingName: "강남파이낸스센터",
        }}
      />,
    );

    expect(screen.getByPlaceholderText("주소")).toHaveValue(
      "서울 강남구 역삼동 737",
    );
  });
});
