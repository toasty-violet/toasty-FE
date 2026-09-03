import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

const worker = setupWorker(...handlers);

let starting: Promise<unknown> | undefined;

// StrictMode 에서 이펙트가 두 번 돌아도 start 는 한 번만 부른다.
export function startWorker() {
  starting ??= worker.start({ onUnhandledRequest: "bypass" });
  return starting;
}
