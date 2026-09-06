import { test, expect } from "@playwright/test";

const PNG =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const photo = (name: string) => ({
  name,
  mimeType: "image/png",
  buffer: Buffer.from(PNG, "base64"),
});

test("사진을 골라 상품을 등록하고 라이브를 만든다", async ({ page }) => {
  await page.goto("/shop/lives/new");
  await page.getByLabel("방송 제목").fill("퍼블릭아이디 확인");

  // 사진을 고르면 상품 설정 단계로 넘어간다.
  await page.locator('input[type="file"]').setInputFiles([photo("a.png")]);

  await page.getByLabel("상품명").fill("가디건");
  await page.getByLabel("가격(원)").fill("32000");
  await page.getByRole("button", { name: "등록하기 (1)" }).click();

  await page.getByRole("button", { name: "저장하기" }).click();
  await expect(page).toHaveURL(/\/shop\/lives\/mock-\d+\/studio$/);
});

test("상품을 편집해도 미리보기 사진이 살아있다", async ({ page }) => {
  await page.goto("/shop/lives/new");
  await page.getByLabel("방송 제목").fill("미리보기 확인");
  await page.locator('input[type="file"]').setInputFiles([photo("a.png")]);

  await page.getByLabel("상품명").first().fill("가디건");
  await page.getByLabel("가격(원)").first().fill("32000");
  await page.getByLabel("재고 늘리기").first().click();

  // blob URL 을 일찍 해제하면 naturalWidth 가 0 이 된다.
  const width = await page
    .locator("img")
    .first()
    .evaluate((img) => (img as HTMLImageElement).naturalWidth);
  expect(width).toBeGreaterThan(0);
});

test("작성 중 뒤로가기를 누르면 저장 여부를 묻는다", async ({ page }) => {
  await page.goto("/shop/lives/new");
  await page.getByLabel("방송 제목").fill("테스트 방송");
  await page.getByLabel("뒤로 가기").click();

  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByText("설정중인 라이브를 저장할까요?")).toBeVisible();
});

test("작성한 게 없으면 묻지 않고 나간다", async ({ page }) => {
  await page.goto("/shop");
  await page.goto("/shop/lives/new");
  await page.getByLabel("방송 제목").waitFor();
  await page.getByLabel("뒤로 가기").click();

  await expect(page).toHaveURL(/\/shop$/);
});

test("상품 설정에서 뒤로가기는 이전 단계로 돌아간다", async ({ page }) => {
  await page.goto("/shop/lives/new");
  await page.getByLabel("방송 제목").fill("t");
  await page.locator('input[type="file"]').setInputFiles([photo("a.png")]);
  await page.getByLabel("상품명").first().waitFor();

  await page.getByLabel("뒤로 가기").click();
  await expect(page.getByLabel("방송 제목")).toBeVisible();
});
