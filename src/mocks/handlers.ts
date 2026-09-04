import { http, HttpResponse } from "msw";
import type { Live, LiveCreateResponse } from "@/types/live";
import type { User } from "@/types/user";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

const ok = <T>(data: T) => HttpResponse.json({ success: true, data });

const fail = (status: number, code: string, message: string) =>
  HttpResponse.json({ success: false, error: { code, message } }, { status });

function buildLive(liveId: number, title: string, description?: string): Live {
  return {
    liveId,
    publicId: `mock-${liveId}`,
    sellerId: 7,
    title,
    description,
    status: "READY",
    playbackUrl: `/mock-playback/${liveId}.m3u8`,
    createdAt: new Date().toISOString(),
  };
}

// 공개 조회는 publicId 로만 받으므로 목도 publicId 를 키로 쓴다.
const lives = new Map<string, Live>();
let nextLiveId = 1;

// 새 탭에서도 시청 화면을 열 수 있도록 하나는 미리 둔다. 주소는 /live/mock-1 이다.
const seeded = buildLive(nextLiveId++, "목 라이브", "시청 화면 확인용");
lives.set(seeded.publicId, seeded);

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

  http.post(`${BASE_URL}/lives`, async ({ request }) => {
    const { title, description } = (await request.json()) as {
      title: string;
      description?: string;
    };

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

    const live = buildLive(nextLiveId++, title, description);
    lives.set(live.publicId, live);

    return ok<LiveCreateResponse>({
      live,
      broadcastCredential: {
        ingestEndpoint: "mock.global-contribute.live-video.net",
        streamKey: "sk_mock_streamkey",
      },
    });
  }),

  http.get(
    "/mock-playback/:file",
    () => new HttpResponse(null, { status: 404 }),
  ),

  http.get(`${BASE_URL}/lives/public/:publicId`, ({ params }) => {
    const live = lives.get(String(params.publicId));
    if (!live) {
      return fail(404, "LIVE_NOT_FOUND", "라이브를 찾을 수 없습니다.");
    }
    return ok(live);
  }),
];
