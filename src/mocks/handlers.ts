import { http, HttpResponse } from "msw";
import type { Live, LiveCreateResponse } from "@/types/live";

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

export const handlers = [
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
