import { test, expect } from "@playwright/test";

test("수정 화면이 편성된 값으로 채워진다", async ({ page }) => {
  await page.goto("/shop/lives/mock-1/edit");

  await expect(
    page.getByRole("heading", { name: "라이브 수정" }),
  ).toBeVisible();
  await expect(page.getByRole("textbox", { name: "방송 제목" })).toHaveValue(
    "목 라이브",
  );
  await expect(page.getByRole("button", { name: "상품 수정" })).toBeVisible();
});

test("제목을 고쳐 저장하면 라이브탭에 반영된다", async ({ page }) => {
  await page.goto("/shop/lives/mock-1/edit");

  const title = page.getByRole("textbox", { name: "방송 제목" });
  await title.waitFor();
  await title.fill("고친 목 라이브");
  await page.getByRole("button", { name: "저장하기" }).click();

  await expect(page).toHaveURL(/\/shop\/lives$/);
  await expect(
    page.getByRole("heading", { name: "고친 목 라이브", exact: true }),
  ).toBeVisible();
});

test("더보기의 수정하기는 수정 화면으로 간다", async ({ page }) => {
  await page.goto("/shop/lives");
  await page.getByRole("button", { name: "더보기" }).first().click();
  await page.getByRole("button", { name: "수정하기" }).click();

  await expect(page).toHaveURL(/\/shop\/lives\/mock-\d+\/edit$/);
});

test("더보기의 삭제하기로 예정 라이브를 지운다", async ({ page }) => {
  await page.goto("/shop/lives");
  const title = await page
    .getByRole("heading", { name: "목 라이브", exact: true })
    .textContent();

  await page.getByRole("button", { name: "더보기" }).first().click();
  await page.getByRole("button", { name: "삭제하기" }).click();

  await expect(page.getByText("삭제한 방송은 되돌릴 수 없어요.")).toBeVisible();
  await page.getByRole("button", { name: "삭제", exact: true }).click();

  await expect(
    page.getByRole("heading", { name: title!, exact: true }),
  ).toBeHidden();
});

test("삭제 모달에서 취소하면 라이브가 남는다", async ({ page }) => {
  await page.goto("/shop/lives");
  await page.getByRole("button", { name: "더보기" }).first().click();
  await page.getByRole("button", { name: "삭제하기" }).click();
  await page.getByRole("button", { name: "취소" }).click();

  await expect(
    page.getByRole("heading", { name: "목 라이브", exact: true }),
  ).toBeVisible();
});

test("상품 설정에서 사진을 더 골라 상품을 추가한다", async ({ page }) => {
  await page.goto("/shop/lives/mock-1/edit");
  await page.getByRole("button", { name: "상품 수정" }).click();
  await expect(page.getByText("총 3개")).toBeVisible();

  await page.getByRole("button", { name: "상품 추가" }).click();
  await page.setInputFiles('input[type="file"]', {
    name: "added.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.from("mock"),
  });

  await expect(page.getByText("총 4개")).toBeVisible();
});
