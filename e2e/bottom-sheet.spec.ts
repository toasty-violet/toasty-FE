import { test, expect } from "@playwright/test";

import { stubApi } from "./support/api";

test("바텀시트를 아래로 끌면 닫힌다", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await stubApi(page);
  await page.goto("/shop/lives");

  // 더보기 시트를 연다.
  await page.getByRole("button", { name: "더보기" }).first().click();
  const sheet = page.getByRole("dialog");
  await expect(sheet).toBeVisible();

  // 손잡이가 있는 윗부분을 잡고 아래로 끈다.
  const box = (await sheet.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + 10);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + 130, { steps: 8 });
  await page.mouse.up();

  await expect(sheet).toBeHidden();
});

test("조금만 끌면 닫히지 않는다", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await stubApi(page);
  await page.goto("/shop/lives");

  await page.getByRole("button", { name: "더보기" }).first().click();
  const sheet = page.getByRole("dialog");
  await expect(sheet).toBeVisible();

  const box = (await sheet.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + 10);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + 40, { steps: 4 });
  await page.mouse.up();

  await expect(sheet).toBeVisible();
});
