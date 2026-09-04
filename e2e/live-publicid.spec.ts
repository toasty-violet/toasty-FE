import { test, expect } from "@playwright/test";

test("미리 둔 목 라이브를 publicId 주소로 연다", async ({ page }) => {
  await page.goto("/live/mock-1");
  await expect(page.getByRole("heading", { name: "목 라이브" })).toBeVisible();
});

test("없는 publicId 는 찾을 수 없음을 보여준다", async ({ page }) => {
  await page.goto("/live/does-not-exist");
  // 404 를 react-query 가 3번 재시도한 뒤에야 에러 화면이 뜬다.
  await expect(page.getByText("라이브를 찾을 수 없습니다.")).toBeVisible({
    timeout: 20000,
  });
});

test("생성 후 시청 링크가 publicId 를 쓴다", async ({ page }) => {
  await page.goto("/live/new");
  await page.getByLabel("제목").fill("퍼블릭아이디 확인");
  await page.getByRole("button", { name: "라이브 만들기" }).click();

  const link = page.getByRole("link", { name: "시청 화면 열기" });
  await expect(link).toHaveAttribute("href", /^\/live\/mock-\d+$/);

  await link.click();
  await expect(
    page.getByRole("heading", { name: "퍼블릭아이디 확인" }),
  ).toBeVisible();
});

test("방송 중인 라이브는 재생 화면을 보여준다", async ({ page }) => {
  await page.goto("/live/mock-2");
  await expect(
    page.getByRole("heading", { name: "방송 중인 목 라이브" }),
  ).toBeVisible();
  await expect(page.locator("video")).toBeVisible();
});

test("종료된 라이브는 종료 안내를 보여준다", async ({ page }) => {
  await page.goto("/live/mock-3");
  await expect(page.getByText("방송이 종료되었습니다")).toBeVisible();
});

test("대기 중인 라이브는 시작 전 안내를 보여준다", async ({ page }) => {
  await page.goto("/live/mock-1");
  await expect(page.getByText("아직 방송이 시작되지 않았습니다")).toBeVisible();
});
