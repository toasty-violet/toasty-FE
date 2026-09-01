"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ApiRequestError } from "@/lib/api-error";
import { createLive } from "@/app/live/_lib/live-api";
import { LIVE_ERROR_CODE } from "@/types/live";
import type { LiveCreateResponse } from "@/types/live";

/** 502는 재시도해도 같은 결과라 재시도를 권하지 않고, 503만 재시도를 유도한다. */
function describeError(error: unknown): { message: string; canRetry: boolean } {
  if (!(error instanceof ApiRequestError)) {
    return {
      message: "서버에 연결할 수 없습니다. 백엔드가 떠 있는지 확인해주세요.",
      canRetry: true,
    };
  }

  switch (error.code) {
    case LIVE_ERROR_CODE.TEMPORARILY_UNAVAILABLE:
      return {
        message: `${error.message} 잠시 후 다시 시도해주세요.`,
        canRetry: true,
      };
    case LIVE_ERROR_CODE.CHANNEL_CREATE_FAILED:
      return {
        message: `${error.message} 재시도해도 같은 결과라 백엔드에 알려야 합니다.`,
        canRetry: false,
      };
    default:
      return { message: error.message, canRetry: false };
  }
}

export function LiveCreateForm({
  onCreated,
}: {
  onCreated: (created: LiveCreateResponse) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const mutation = useMutation({
    mutationFn: createLive,
    onSuccess: onCreated,
  });

  const fieldErrors =
    mutation.error instanceof ApiRequestError
      ? mutation.error.fields
      : undefined;

  return (
    <form
      className="flex flex-col gap-4 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate({
          title: title.trim(),
          description: description.trim() || undefined,
        });
      }}
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-sm font-medium">
          제목
        </label>
        <input
          id="title"
          value={title}
          maxLength={100}
          required
          onChange={(event) => setTitle(event.target.value)}
          placeholder="빈티지 여름옷 라이브"
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-medium">
          설명
        </label>
        <textarea
          id="description"
          value={description}
          maxLength={1000}
          rows={3}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="여름 상품을 소개합니다"
          className="resize-none rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      {mutation.error && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
        >
          <p>{describeError(mutation.error).message}</p>
          {fieldErrors && (
            <ul className="mt-1 list-inside list-disc">
              {fieldErrors.map((fieldError) => (
                <li key={fieldError.field}>{fieldError.message}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={mutation.isPending || !title.trim()}
        className="rounded-lg bg-zinc-900 py-3 text-sm font-medium text-white disabled:opacity-40 dark:bg-white dark:text-zinc-900"
      >
        {mutation.isPending
          ? "라이브를 만드는 중…"
          : mutation.error && describeError(mutation.error).canRetry
            ? "다시 시도"
            : "라이브 만들기"}
      </button>
    </form>
  );
}
