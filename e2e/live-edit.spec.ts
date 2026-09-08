import { test, expect } from "@playwright/test";

test("수정 화면이 편성된 값으로 채워진다", async ({ page }) => {
  await page.goto("/shop/lives/mock-1/edit");

  await expect(page.getByRole("heading", { name: "라이브 수정" })).toBeVisible();
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

test("라이브탭의 더보기는 수정 화면으로 간다", async ({ page }) => {
  await page.goto("/shop/lives");
  await page.getByRole("button", { name: "더보기" }).first().click();

  await expect(page).toHaveURL(/\/shop\/lives\/mock-\d+\/edit$/);
});
