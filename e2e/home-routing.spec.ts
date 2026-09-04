import { test, expect, type Page } from "@playwright/test";

const API = "http://localhost:8080/api/v1";

// MSW 보다 앞단에서 가로채 시나리오를 고정한다.
async function stub(
  page: Page,
  scenario: {
    loggedIn: boolean;
    // role 키를 아예 내려주지 않는 경우는 me 에 nickname 만 담는다
    me?: Record<string, unknown>;
  },
) {
  await page.route(`${API}/refresh`, (route) =>
    route.fulfill({
      status: scenario.loggedIn ? 200 : 401,
      contentType: "application/json",
      body: JSON.stringify(
        scenario.loggedIn
          ? { success: true, data: { accessToken: "t" } }
          : {
              success: false,
              error: { code: "AUTH_EXPIRED", message: "만료" },
            },
      ),
    }),
  );
  await page.route(`${API}/users/me`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: scenario.me ?? { nickname: "tester" },
      }),
    }),
  );
  // 서비스워커가 요청을 가로채기 전에 라우트가 걸리도록 목을 끈다.
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "serviceWorker", { value: undefined });
  });
}

test("SELLER 는 홈에서 /shop 으로 이동한다", async ({ page }) => {
  await stub(page, { loggedIn: true, me: { role: "SELLER", nickname: "t" } });
  await page.goto("/");

  await expect(page).toHaveURL(/\/shop$/);
  await expect(
    page.getByRole("heading", { name: "상점 페이지 (/shop)" }),
  ).toBeVisible();
});

test("role 이 null 이면 홈에서 /onboarding 로 이동한다", async ({ page }) => {
  await stub(page, { loggedIn: true, me: { role: null, nickname: "t" } });
  await page.goto("/");

  await expect(page).toHaveURL(/\/onboarding$/);
  await expect(
    page.getByRole("heading", { name: "역할 선택 페이지 (/onboarding)" }),
  ).toBeVisible();
});

// 실제 응답은 {"success":true,"data":{"nickname":"user_0a8c9dbad596"}} 처럼 role 키가 아예 없다
test("role 키가 없으면 홈에서 /onboarding 로 이동한다", async ({ page }) => {
  await stub(page, {
    loggedIn: true,
    me: { nickname: "user_0a8c9dbad596" },
  });
  await page.goto("/");

  await expect(page).toHaveURL(/\/onboarding$/);
  await expect(
    page.getByRole("heading", { name: "역할 선택 페이지 (/onboarding)" }),
  ).toBeVisible();
});

// 잘못 보내면 홈과 대상 페이지 사이를 오가는 루프가 생긴다.
// 특정 순간의 주소만 보면 루프 중에도 통과할 수 있어 이동 자체가 없었는지를 센다.
async function countNavigations(page: Page, run: () => Promise<void>) {
  const urls: string[] = [];
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) urls.push(frame.url());
  });
  await run();
  await page.waitForTimeout(1500);
  return urls;
}

test("CUSTOMER 는 홈에 머문다", async ({ page }) => {
  await stub(page, { loggedIn: true, me: { role: "CUSTOMER", nickname: "t" } });

  const urls = await countNavigations(page, () =>
    page.goto("/").then(() => {}),
  );

  expect(urls.every((url) => new URL(url).pathname === "/")).toBe(true);
  await expect(page).toHaveURL("http://localhost:3000/");
});

test("비로그인은 홈에 머문다", async ({ page }) => {
  await stub(page, { loggedIn: false });

  const urls = await countNavigations(page, () =>
    page.goto("/").then(() => {}),
  );

  expect(urls.every((url) => new URL(url).pathname === "/")).toBe(true);
  await expect(page).toHaveURL("http://localhost:3000/");
});

test("CUSTOMER 가 /shop 에 직접 가면 홈으로 돌아간다", async ({ page }) => {
  await stub(page, { loggedIn: true, me: { role: "CUSTOMER", nickname: "t" } });
  await page.goto("/shop");

  await expect(page).toHaveURL("http://localhost:3000/");
});

test("비로그인이 /shop 에 직접 가면 /login 으로 간다", async ({ page }) => {
  await stub(page, { loggedIn: false });
  await page.goto("/shop");

  await expect(page).toHaveURL(/\/login$/);
});
