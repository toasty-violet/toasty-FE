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
  /** 시청 화면이 어떤 라이브도 찾지 못하는 경우. */
  liveMissing?: boolean;
};

function tomorrowEvening() {
  const at = new Date();
  at.setDate(at.getDate() + 1);
  at.setHours(20, 0, 0, 0);
  return at.toISOString();
}

export async function stubApi(page: Page, scenario: Scenario = {}) {
  const { tab = "full", liveMissing = false } = scenario;

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
  seed("종료된 목 라이브", "ENDED");

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

    const liveNotFound = () =>
      route.fulfill({
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
      const live = liveMissing ? undefined : lives.get(publicOne[1]);
      return live ? ok(live) : liveNotFound();
    }

    // 시청 화면은 라이브 정보와 따로 재생 정보를 폴링한다.
    const playback = path.match(/^\/lives\/public\/([^/]+)\/playback$/);
    if (playback) {
      const live = liveMissing ? undefined : lives.get(playback[1]);
      return live
        ? ok({ playbackUrl: live.playbackUrl, status: live.status })
        : liveNotFound();
    }
    // 라이브 생성은 사진 발급 → S3 업로드 → 생성 순으로 부른다.
    if (path === "/seller/products/images/upload-url") {
      const { files } = request.postDataJSON() as { files: unknown[] };

      // 서버와 같게 한 번에 20 장까지만 받는다. 나눠 부르지 않으면 여기서 걸린다.
      if (files.length > 20) {
        return route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({
            success: false,
            error: {
              code: "COMMON_INVALID_INPUT",
              message: "사진은 한 번에 20장까지 올릴 수 있습니다.",
            },
          }),
        });
      }

      return ok({
        uploads: files.map((_, index) => ({
          objectKey: `products/pending/${index}.jpg`,
          uploadUrl: `${url.origin}/api/v1/stub-upload/${index}`,
          expiresIn: 300,
        })),
      });
    }

    // 사진 본문은 받지 않고 성공만 돌려준다.
    if (path.startsWith("/stub-upload/")) {
      return route.fulfill({ status: 200, body: "" });
    }

    if (path === "/lives" && request.method() === "POST") {
      const { title } = request.postDataJSON() as { title: string };
      const liveId = nextLiveId++;
      const live: Live = {
        liveId,
        publicId: `mock-${liveId}`,
        sellerId: 7,
        title,
        status: "READY",
        scheduledAt: tomorrowEvening(),
        playbackUrl: `/playback/${liveId}.m3u8`,
        createdAt: new Date().toISOString(),
      };
      lives.set(live.publicId, live);

      return ok({
        live,
        broadcastCredential: {
          ingestEndpoint: "stub.live-video.net",
          streamKey: `sk_stub_${liveId}`,
        },
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
