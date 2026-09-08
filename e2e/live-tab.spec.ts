import { test, expect } from "@playwright/test";

import { stubApi } from "./support/api";

test("방송 중·예정 라이브를 보여준다", async ({ page }) => {
  await stubApi(page);
  await page.goto("/shop/lives");

  await expect(page.getByText("지금 방송중")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "방송 중인 목 라이브" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "방송 보기" })).toBeVisible();

  await expect(page.getByText("예정된 라이브")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "목 라이브", exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/상품 \d+개/)).toBeVisible();
});

test("집계가 없으면 현황을 - 로 둔다", async ({ page }) => {
  await stubApi(page);
  await page.goto("/shop/lives");

  await expect(page.getByText("최신 라이브 현황")).toBeVisible();
  await expect(page.getByText("-명")).toBeVisible();
  await expect(page.getByText("-건")).toBeVisible();
  await expect(page.getByText("-원")).toBeVisible();
});

test("신규 라이브를 누르면 생성 화면으로 간다", async ({ page }) => {
  await stubApi(page);
  await page.goto("/shop/lives");
  await page.getByRole("button", { name: "신규 라이브" }).click();

  await expect(page).toHaveURL(/\/shop\/lives\/new$/);
});

test("예정 라이브의 방송 시작은 스튜디오로 보낸다", async ({ page }) => {
  await stubApi(page);
  await page.goto("/shop/lives");
  await page.getByRole("button", { name: "방송 시작" }).first().click();

  await expect(page).toHaveURL(/\/shop\/lives\/mock-\d+\/studio$/);
});

test("예정된 라이브가 없으면 빈 상태를 보여준다", async ({ page }) => {
  await stubApi(page, { tab: "empty" });
  await page.goto("/shop/lives");

  await expect(page.getByText("예정된 라이브가 없어요")).toBeVisible();
  // 디자인대로 두 줄이라 줄바꿈을 건너뛰고 찾는다.
  await expect(page.getByText(/라이브를 설정하고/)).toBeVisible();
  await expect(page.getByText(/방송을 시작해보세요!/)).toBeVisible();
  // 방송 중이 아니면 카드를 통째로 숨긴다.
  await expect(page.getByText("지금 방송중")).toBeHidden();
  // 현황 섹션은 값이 없어도 남는다.
  await expect(page.getByText("최신 라이브 현황")).toBeVisible();
});
