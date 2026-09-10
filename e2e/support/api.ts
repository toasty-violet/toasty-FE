import type { Page } from "@playwright/test";
import type {
  Live,
  LiveProducts,
  LiveViewer,
  LiveProduct,
  LiveStatus,
  LiveWithProducts,
  SellerLiveTab,
} from "@/types/live";

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
  /** 미리 고정해 둘 상품. 방송 중인 라이브(mock-2)에 걸린다. */
  pinnedProductId?: number;
  /** 비로그인으로 열 때. 기본은 로그인된 셀러다. */
  loggedIn?: boolean;
};

function tomorrowEvening() {
  const at = new Date();
  at.setDate(at.getDate() + 1);
  at.setHours(20, 0, 0, 0);
  return at.toISOString();
}

export async function stubApi(page: Page, scenario: Scenario = {}) {
  const {
    tab = "full",
    liveMissing = false,
    pinnedProductId,
    loggedIn = true,
  } = scenario;

  const lives = new Map<string, Live>();
  const products = new Map<number, LiveProduct[]>();
  let nextLiveId = 1;
  let nextProductId = 1;
  const pinned = new Map<number, number>();

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

  const seedProducts = (liveId: number, names: string[]) =>
    products.set(
      liveId,
      names.map((name, index) => ({
        productId: nextProductId++,
        liveProductId: nextProductId,
        name,
        price: 39000 + index * 10000,
        stockQuantity: 10 + index,
        imageUrl: `/product-image/${name}.png`,
        displayOrder: index,
        status: "SCHEDULED" as const,
      })),
    );

  seed("목 라이브", "READY");
  seed("방송 중인 목 라이브", "LIVE");
  seed("종료된 목 라이브", "ENDED");
  seedProducts(1, ["니트 가디건", "코듀로이 팬츠", "울 머플러"]);
  seedProducts(2, ["레더 자켓", "데님 셔츠"]);
  // 서버는 고정하면 그 상품을 ACTIVE 로 바꾸고 되돌리지 않는다.
  const pin = (liveId: number, productId: number) => {
    pinned.set(liveId, productId);
    products.set(
      liveId,
      (products.get(liveId) ?? []).map((item) =>
        item.productId === productId ? { ...item, status: "ACTIVE" } : item,
      ),
    );
  };

  if (pinnedProductId !== undefined) pin(2, pinnedProductId);

  const byLiveId = (liveId: number) =>
    [...lives.values()].find((live) => live.liveId === liveId);

  // 사진을 바꾸지 않은 상품은 imageObjectKey 가 없다. 쓰던 주소를 그대로 둔다.
  const toProducts = (
    payload: {
      productId?: number;
      name: string;
      price: number;
      stockQuantity: number;
      imageObjectKey?: string;
    }[],
    previous: LiveProduct[] = [],
  ): LiveProduct[] =>
    payload.map((item, index) => {
      const kept =
        !item.imageObjectKey &&
        previous.find((old) => old.productId === item.productId);
      return {
        productId: item.productId ?? nextProductId++,
        liveProductId: nextProductId++,
        name: item.name,
        price: item.price,
        stockQuantity: item.stockQuantity,
        imageUrl: kept ? kept.imageUrl : `/product-image/${item.name}.png`,
        displayOrder: index,
        status: "SCHEDULED" as const,
      };
    });

  await page.addInitScript(() => {
    // 서비스워커가 먼저 가로채지 않도록 끈다.
    Object.defineProperty(navigator, "serviceWorker", { value: undefined });
  });

  await page.route("**/product-image/**", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="160" height="160" fill="#E5E7EB"/></svg>',
    }),
  );

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

    if (path === "/refresh") {
      return loggedIn
        ? ok({ accessToken: "test-token" })
        : route.fulfill({
            status: 401,
            contentType: "application/json",
            body: JSON.stringify({
              success: false,
              error: { code: "AUTH_EXPIRED", message: "만료" },
            }),
          });
    }
    if (path === "/logout") return ok(null);
    if (path === "/users/role") return ok({ role: "SELLER" });

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
            productCount: products.get(live.liveId)?.length ?? 0,
          }))
          .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)),
      };
      return ok(body);
    }

    // 방송 시작이 스튜디오로 넘어갈 때 그 화면이 부르는 것들이다.
    const viewerCount = path.match(/^\/lives\/public\/([^/]+)\/viewer-count$/);
    if (viewerCount) {
      return ok({ viewerCount: 132 });
    }

    // 토큰만 내려준다. 진짜 IVS 채팅방에는 붙지 못하고 화면은 빈 채로 남는다.
    const chatToken = path.match(/^\/lives\/public\/([^/]+)\/chat-token$/);
    if (chatToken) {
      const live = lives.get(chatToken[1]);
      if (!live) return liveNotFound();
      return ok({
        token: "mock-chat-token",
        expiresAt: new Date(Date.now() + 3600_000).toISOString(),
        writable: loggedIn,
      });
    }

    const publicOne = path.match(/^\/lives\/public\/([^/]+)$/);
    if (publicOne) {
      const live = liveMissing ? undefined : lives.get(publicOne[1]);
      if (!live) return liveNotFound();

      const viewer: LiveViewer = {
        ...live,
        seller: {
          sellerId: live.sellerId,
          shopName: "목 스토어",
          shopImageUrl: "/product-image/shop.png",
        },
      };
      return ok(viewer);
    }

    // 시청 화면도 같은 형태를 받는다. 인증만 없다.
    const publicProducts = path.match(/^\/lives\/public\/([^/]+)\/products$/);
    if (publicProducts) {
      const live = lives.get(publicProducts[1]);
      if (!live) return liveNotFound();

      const body: LiveProducts = {
        currentPinnedProductId: pinned.get(live.liveId) ?? null,
        products: products.get(live.liveId) ?? [],
      };
      return ok(body);
    }

    // 방송 화면의 전체 상품 시트. 고정된 적이 없으면 currentPinnedProductId 가 null 이다.
    const liveProducts = path.match(/^\/lives\/(\d+)\/products$/);
    if (liveProducts) {
      const live = byLiveId(Number(liveProducts[1]));
      if (!live) return liveNotFound();

      const body: LiveProducts = {
        currentPinnedProductId: pinned.get(live.liveId) ?? null,
        products: products.get(live.liveId) ?? [],
      };
      return ok(body);
    }

    const pinRequest = path.match(/^\/lives\/(\d+)\/products\/(\d+)\/pin$/);
    if (pinRequest) {
      pin(Number(pinRequest[1]), Number(pinRequest[2]));
      return ok(null);
    }

    const editProduct = path.match(/^\/lives\/(\d+)\/products\/(\d+)$/);
    if (editProduct && request.method() === "PATCH") {
      const liveId = Number(editProduct[1]);
      const productId = Number(editProduct[2]);
      const patch = JSON.parse(request.postData() ?? "{}") as {
        price: number;
        stockQuantity: number;
      };
      products.set(
        liveId,
        (products.get(liveId) ?? []).map((product) =>
          product.productId === productId ? { ...product, ...patch } : product,
        ),
      );
      return ok(null);
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

    // 수정 화면은 상세를 읽어 폼을 채우고, 저장·삭제로 상태를 바꾼다.
    const one = path.match(/^\/lives\/(\d+)$/);
    if (one) {
      const live = byLiveId(Number(one[1]));
      if (!live) return liveNotFound();

      if (request.method() === "GET") {
        const detail: LiveWithProducts = {
          live,
          products: products.get(live.liveId) ?? [],
        };
        return ok(detail);
      }
      if (request.method() === "PATCH") {
        const patch = JSON.parse(request.postData() ?? "{}") as {
          title?: string;
          description?: string;
          scheduledAt?: string;
          products?: Parameters<typeof toProducts>[0];
        };
        live.title = patch.title ?? live.title;
        live.description = patch.description ?? live.description;
        live.scheduledAt = patch.scheduledAt ?? live.scheduledAt;
        if (patch.products) {
          products.set(
            live.liveId,
            toProducts(patch.products, products.get(live.liveId)),
          );
        }
        return ok(null);
      }
      if (request.method() === "DELETE") {
        lives.delete(live.publicId);
        products.delete(live.liveId);
        return ok(null);
      }
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
