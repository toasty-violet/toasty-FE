type ButtonVariant = "solid" | "outlined";
type ButtonColor = "primary" | "secondary" | "assistive";
type ButtonSize = "lg" | "md" | "sm" | "xs";

type ButtonProps = {
  label: string;
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
};

const sizeStyles: Record<ButtonSize, string> = {
  lg: "text-l1-semibold h-56 gap-6 rounded-12 px-24",
  md: "text-l4-semibold h-[4.4rem] gap-4 rounded-10 px-20",
  sm: "text-l5-semibold h-36 gap-4 rounded-8 px-16",
  xs: "text-l5-semibold h-32 gap-4 rounded-8 px-12",
};

const solidStyles: Record<ButtonColor, string> = {
  primary: "bg-bg-brand-solid text-fg-neutral-inverted",
  secondary: "bg-bg-neutral-strong text-fg-neutral-inverted",
  assistive: "bg-bg-neutral-weak text-fg-neutral-primary",
};

const solidDisabledStyles: Record<ButtonColor, string> = {
  primary: "bg-bg-neutral-disabled text-fg-neutral-placeholder",
  secondary: "bg-bg-neutral-disabled text-fg-neutral-placeholder",
  assistive: "bg-bg-neutral-weak text-fg-neutral-disabled",
};

// 디자인에 Outlined x Secondary 조합이 없어 Assistive와 동일하게 처리한다.
const outlinedStyles: Record<ButtonColor, string> = {
  primary: "border-stroke-neutral-weak border text-fg-brand",
  secondary: "border-stroke-neutral-weak border text-fg-neutral-primary",
  assistive: "border-stroke-neutral-weak border text-fg-neutral-primary",
};

const outlinedDisabledStyle =
  "border-stroke-neutral-weak border text-fg-neutral-disabled";

export function Button({
  label,
  variant = "solid",
  color = "primary",
  size = "lg",
  disabled = false,
  onClick,
  type = "button",
}: ButtonProps) {
  const colorStyle =
    variant === "outlined"
      ? disabled
        ? outlinedDisabledStyle
        : outlinedStyles[color]
      : disabled
        ? solidDisabledStyles[color]
        : solidStyles[color];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center transition-colors ${sizeStyles[size]} ${colorStyle}`}
    >
      {label}
    </button>
  );
}
