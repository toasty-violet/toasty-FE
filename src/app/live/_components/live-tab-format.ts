const DATE = new Intl.DateTimeFormat("ko-KR", {
  year: "2-digit",
  month: "2-digit",
  day: "2-digit",
});

const TIME = new Intl.DateTimeFormat("ko-KR", { hour: "numeric" });

const NUMBER = new Intl.NumberFormat("ko-KR");

/** "26. 09. 13 오후 8시" */
export function formatScheduledAt(iso: string) {
  const at = new Date(iso);
  return `${DATE.format(at).replace(/\.$/, "")} ${TIME.format(at)}`;
}

/** 값이 없으면 자리만 남긴다. 집계가 생기기 전까지 늘 이 상태다. */
export function formatStat(value: number | undefined, unit: string) {
  return value === undefined ? `-${unit}` : `${NUMBER.format(value)}${unit}`;
}
