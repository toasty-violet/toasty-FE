import type { Page } from "@playwright/test";
import type { Live, LiveStatus, SellerLiveTab } from "@/types/live";

/**
 * 화면이 부르는 API 를 테스트 안에서 대신 받아준다.
 * 경로마다 라우트를 나누면 나중에 등록한 것이 먼저 잡혀 /lives/me 가
 * /lives/{id} 에 먹히므로, 하나로 받아 안에서 갈라 순서에 기대지 않는다.
 */

export type Scenario = {
  /** 라이브탭이 받을 조합. */
  tab?: "full" | "empty" | "scheduled" | "stat";
};

function tomorrowEvening() {
  const at = new Date();
  at.setDate(at.getDate() + 1);
  at.setHours(20, 0, 0, 0);
  return at.toISOString();
}

export async function stubApi(page: Page, scenario: Scenario = {}) {
  const { tab = "full" } = scenario;

  const lives = new Map<string, Live>();
  const productCounts = new Map<number, number>([
    [1, 3],
    [2, 5],
  ]);
  let nextLiveId = 1;

  const seed = (title: string, status: LiveStatus) => {
    const liveId = nextLiveId++;
    lives.set(`mock-${liveId}`, {
      liveId,
      publicId: `mock-${liveId}`,
      sellerId: 7,
      title,
      description: "설명",
      status,
      scheduledAt: tomorrowEvening(),
      playbackUrl: `/playback/${liveId}.m3u8`,
      createdAt: new Date().toISOString(),
      startedAt: status === "READY" ? undefined : new Date().toISOString(),
    });
  };

  seed("목 라이브", "READY");
  seed("방송 중인 목 라이브", "LIVE");

  await page.addInitScript(() => {
    // 서비스워커가 먼저 가로채지 않도록 끈다.
    Object.defineProperty(navigator, "serviceWorker", { value: undefined });
  });

  await page.route("**/api/v1/**", (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace(/^.*\/api\/v1/, "");

    const ok = (data: unknown) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data }),
      });

    if (path === "/refresh") return ok({ accessToken: "test-token" });
    if (path === "/logout") return ok(null);
    if (path === "/users/me") return ok({ role: "SELLER", nickname: "tester" });

    if (path === "/lives/me") {
      const mine =
        tab === "empty" || tab === "stat"
          ? []
          : [...lives.values()].filter(
              (live) => tab !== "scheduled" || live.status !== "LIVE",
            );
      const broadcasting = mine.find((live) => live.status === "LIVE");

      const body: SellerLiveTab = {
        // 주문·시청자 집계가 아직 없어 서버는 항상 null 을 준다.
        latestStat:
          tab === "stat"
            ? { viewerCount: 32, orderCount: 12, salesAmount: 348000 }
            : null,
        broadcasting: broadcasting
          ? {
              liveId: broadcasting.liveId,
              publicId: broadcasting.publicId,
              title: broadcasting.title,
              playbackUrl: broadcasting.playbackUrl,
              sellThroughRate: 0,
            }
          : null,
        scheduled: mine
          .filter((live) => live.status === "READY")
          .map((live) => ({
            liveId: live.liveId,
            publicId: live.publicId,
            title: live.title,
            scheduledAt: live.scheduledAt,
            productCount: productCounts.get(live.liveId) ?? 0,
          }))
          .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)),
      };
      return ok(body);
    }

    // 방송 시작이 스튜디오로 넘어갈 때 그 화면이 부르는 것들이다.
    const publicOne = path.match(/^\/lives\/public\/([^/]+)$/);
    if (publicOne) {
      const live = lives.get(publicOne[1]);
      return live
        ? ok(live)
        : route.fulfill({
            status: 404,
            contentType: "application/json",
            body: JSON.stringify({
              success: false,
              error: {
                code: "LIVE_NOT_FOUND",
                message: "라이브를 찾을 수 없습니다.",
              },
            }),
          });
    }
    if (path.endsWith("/stream-status")) {
      const liveId = Number(path.split("/")[2]);
      const live = [...lives.values()].find((it) => it.liveId === liveId);
      return ok({
        status: live?.status ?? "READY",
        broadcasting: live?.status === "LIVE",
        startedAt: live?.startedAt,
      });
    }

    // 조용히 통과하지 않도록 어떤 요청인지 남긴다.
    return route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({
        success: false,
        error: {
          code: "NOT_STUBBED",
          message: `테스트가 안 받은 요청: ${request.method()} ${path}`,
        },
      }),
    });
  });
}
