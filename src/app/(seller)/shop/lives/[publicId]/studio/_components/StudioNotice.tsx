"use client";

/** 방송 화면 대신 띄우는 안내. 배경이 검정이라 글자를 밝게 둔다. */
export function StudioNotice({
  children,
  alert = false,
  onBack,
}: {
  children: React.ReactNode;
  alert?: boolean;
  onBack?: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-16 bg-black px-20">
      <p
        role={alert ? "alert" : undefined}
        className="text-l4-semibold text-fg-neutral-inverted text-center"
      >
        {children}
      </p>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="rounded-8 text-l5-semibold bg-bg-neutral-solid text-fg-neutral-inverted h-36 px-16"
        >
          라이브탭으로
        </button>
      )}
    </div>
  );
}
