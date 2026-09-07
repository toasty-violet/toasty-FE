import { http, HttpResponse } from "msw";
import type {
  BroadcastCredential,
  Live,
  LiveCreateResponse,
  LivePlayback,
  LiveStatus,
  LiveStreamStatus,
  ProductImageUpload,
  ProductImageUploadFile,
} from "@/types/live";
import type { User } from "@/types/user";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

const ok = <T>(data: T) => HttpResponse.json({ success: true, data });

const fail = (status: number, code: string, message: string) =>
  HttpResponse.json({ success: false, error: { code, message } }, { status });

const notFound = () =>
  fail(404, "LIVE_NOT_FOUND", "라이브를 찾을 수 없습니다.");

const TAKEN_NICKNAMES = ["토스티", "toasty", "admin"];

function tomorrowEvening() {
  const at = new Date();
  at.setDate(at.getDate() + 1);
  at.setHours(20, 0, 0, 0);
  return at.toISOString();
}

function buildLive(
  liveId: number,
  title: string,
  description?: string,
  status: LiveStatus = "READY",
  scheduledAt: string = tomorrowEvening(),
): Live {
  return {
    liveId,
    publicId: `mock-${liveId}`,
    sellerId: 7,
    title,
    description,
    status,
    scheduledAt,
    playbackUrl: `/mock-playback/${liveId}.m3u8`,
    createdAt: new Date().toISOString(),
    startedAt: status === "READY" ? undefined : new Date().toISOString(),
    endedAt: status === "ENDED" ? new Date().toISOString() : undefined,
  };
}

// 공개 조회는 publicId 로만 받으므로 목도 publicId 를 키로 쓴다.
const lives = new Map<string, Live>();
let nextLiveId = 1;

function seed(title: string, description: string, status: LiveStatus) {
  const live = buildLive(nextLiveId++, title, description, status);
  lives.set(live.publicId, live);
}

// 송출 화면은 SDK 가 가짜 엔드포인트에 붙지 못해 LIVE 로 넘어가지 못한다.
// 시청 화면의 세 상태를 눌러볼 수 있도록 상태별로 하나씩 미리 둔다.
seed("목 라이브", "방송 시작 전 대기 화면", "READY"); // /live/mock-1
seed("방송 중인 목 라이브", "재생 시도 화면", "LIVE"); // /live/mock-2
seed("종료된 목 라이브", "방송 종료 화면", "ENDED"); // /live/mock-3

function findByLiveId(liveId: number) {
  return [...lives.values()].find((live) => live.liveId === liveId);
}

function issueCredential(liveId: number): BroadcastCredential {
  return {
    ingestEndpoint: "mock.global-contribute.live-video.net",
    // 재발급마다 값이 바뀌는 것을 확인할 수 있게 호출 시각을 붙인다.
    streamKey: `sk_mock_${liveId}_${Date.now()}`,
  };
}

// 목 로그인 시나리오는 주소의 쿼리로 바꾼다.
// ?mockRole=CUSTOMER | none 으로 역할을, ?mockAuth=guest 로 비로그인 상태를 확인할 수 있다.
// 리다이렉트로 쿼리가 사라져도 시나리오가 유지되도록 첫 진입 값을 기억한다.
let scenario: { role: User["role"]; isGuest: boolean } | undefined;

function mockScenario() {
  if (!scenario) {
    const mockRole = new URLSearchParams(window.location.search).get(
      "mockRole",
    );
    scenario = {
      // none 은 아직 역할을 고르지 않은 유저다. 서버는 이때 role 키를 아예 빼고 준다
      role:
        mockRole === "CUSTOMER"
          ? "CUSTOMER"
          : mockRole === "none"
            ? undefined
            : "SELLER",
      isGuest:
        new URLSearchParams(window.location.search).get("mockAuth") === "guest",
    };
  }
  return scenario;
}

export const handlers = [
  http.get(`${BASE_URL}/login/kakao`, () =>
    ok({ accessToken: "mock-access-token" }),
  ),

  http.post(`${BASE_URL}/refresh`, () =>
    mockScenario().isGuest
      ? fail(401, "AUTH_REFRESH_TOKEN_EXPIRED", "다시 로그인해 주세요.")
      : ok({ accessToken: "mock-access-token" }),
  ),

  http.post(`${BASE_URL}/logout`, () => ok("로그아웃되었습니다.")),

  http.get(`${BASE_URL}/users/me`, () =>
    ok<User>({ role: mockScenario().role, nickname: "user_a3f9c2e81b04" }),
  ),

  // 중복 화면을 눌러볼 수 있도록 정해둔 닉네임만 이미 쓰인 것으로 다룬다.
  http.get(`${BASE_URL}/search-nickname`, ({ request }) => {
    const nickname = new URL(request.url).searchParams.get("nickname") ?? "";

    return ok({ duplicated: TAKEN_NICKNAMES.includes(nickname) });
  }),

  // 실제 서버처럼 역할을 확정해, 완료 화면에서 새로고침해도 가드에 걸리지 않게 한다.
  http.put(`${BASE_URL}/users/onboarding/customer`, () => {
    mockScenario().role = "CUSTOMER";

    return ok("구매자 정보가 등록되었습니다.");
  }),

  // 사진 본문은 목이 받지 않는다. uploadUrl 은 아래 PUT 핸들러가 200 만 돌려준다.
  http.post(
    `${BASE_URL}/seller/products/images/upload-url`,
    async ({ request }) => {
      const { files } = (await request.json()) as {
        files: ProductImageUploadFile[];
      };

      // 서버와 같게 한 번에 20 장까지만 받는다.
      if (files.length > 20) {
        return fail(
          400,
          "COMMON_INVALID_INPUT",
          "사진은 한 번에 20장까지 올릴 수 있습니다.",
        );
      }

      return ok<{ uploads: ProductImageUpload[] }>({
        uploads: files.map((_, index) => ({
          objectKey: `products/pending/mock-${Date.now()}-${index}.jpg`,
          uploadUrl: `/mock-upload/${Date.now()}-${index}`,
          expiresIn: 300,
        })),
      });
    },
  ),

  http.put("/mock-upload/:key", () => new HttpResponse(null, { status: 200 })),

  http.post(`${BASE_URL}/lives`, async ({ request }) => {
    const { title, description, scheduledAt, products } =
      (await request.json()) as {
        title: string;
        description?: string;
        scheduledAt: string;
        products: unknown[];
      };

    if (!products?.length) {
      return fail(
        400,
        "COMMON_INVALID_INPUT",
        "판매할 상품을 한 개 이상 등록해주세요.",
      );
    }
    if (new Date(scheduledAt) <= new Date()) {
      return fail(
        400,
        "COMMON_INVALID_INPUT",
        "방송 예정 시각은 현재 이후여야 합니다.",
      );
    }

    if (title.includes("502")) {
      return fail(
        502,
        "LIVE_CHANNEL_CREATE_FAILED",
        "라이브 채널을 만들지 못했습니다.",
      );
    }
    if (title.includes("503")) {
      return fail(
        503,
        "LIVE_STREAMING_TEMPORARILY_UNAVAILABLE",
        "일시적으로 라이브를 시작할 수 없습니다.",
      );
    }

    const live = buildLive(
      nextLiveId++,
      title,
      description,
      "READY",
      scheduledAt,
    );
    lives.set(live.publicId, live);

    return ok<LiveCreateResponse>({
      live,
      broadcastCredential: issueCredential(live.liveId),
    });
  }),

  http.get(
    "/mock-playback/:file",
    () => new HttpResponse(null, { status: 404 }),
  ),

  http.get(`${BASE_URL}/lives/public/:publicId`, ({ params }) => {
    const live = lives.get(String(params.publicId));
    return live ? ok(live) : notFound();
  }),

  http.post(`${BASE_URL}/lives/:liveId/broadcast-credentials`, ({ params }) => {
    const live = findByLiveId(Number(params.liveId));
    if (!live) return notFound();
    if (live.status === "ENDED") {
      return fail(
        409,
        "LIVE_ALREADY_ENDED",
        "종료된 라이브는 재발급할 수 없습니다.",
      );
    }
    return ok<BroadcastCredential>(issueCredential(live.liveId));
  }),

  // 실제 서버는 IVS 가 송출을 받고 있을 때만 LIVE 로 전이시킨다.
  // 목에는 송출하는 쪽이 없으므로 저장된 상태를 그대로 돌려준다.
  http.get(`${BASE_URL}/lives/:liveId/stream-status`, ({ params }) => {
    const live = findByLiveId(Number(params.liveId));
    if (!live) return notFound();

    return ok<LiveStreamStatus>({
      status: live.status,
      broadcasting: live.status === "LIVE",
      startedAt: live.startedAt,
    });
  }),

  // 실제 서버와 같게 저장된 상태만 읽는다.
  http.get(`${BASE_URL}/lives/public/:publicId/playback`, ({ params }) => {
    const live = lives.get(String(params.publicId));
    if (!live) return notFound();

    return ok<LivePlayback>({
      playbackUrl: live.playbackUrl,
      status: live.status,
    });
  }),

  // 이미 종료된 라이브에 다시 요청해도 200 인 멱등 처리다.
  http.post(`${BASE_URL}/lives/:liveId/end`, ({ params }) => {
    const live = findByLiveId(Number(params.liveId));
    if (!live) return notFound();

    if (live.status !== "ENDED") {
      live.status = "ENDED";
      live.endedAt = new Date().toISOString();
    }

    return ok(live);
  }),
];
