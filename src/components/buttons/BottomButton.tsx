type BottomButtonProps = {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  /** 버튼 위에 덧붙이는 안내 문구. */
  description?: string;
};

export function BottomButton({
  label,
  onClick,
  disabled = false,
  type = "button",
  description,
}: BottomButtonProps) {
  return (
    <div className="flex h-fit w-full flex-col gap-12 px-20 pt-10 pb-20">
      {description && (
        <p className="text-c1-medium text-fg-neutral-primary text-center">
          {description}
        </p>
      )}
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className="text-l1-semibold bg-bg-brand-solid text-fg-neutral-inverted rounded-12 disabled:bg-bg-neutral-disabled disabled:text-fg-neutral-placeholder active:bg-bg-brand-solid-pressed flex h-[5.6rem] w-full items-center justify-center gap-6 px-24 transition-colors"
      >
        {label}
      </button>
    </div>
  );
}
