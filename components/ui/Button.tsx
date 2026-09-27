import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "subtle";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-accent text-white hover:bg-[#6d5fe6] disabled:bg-accent/40 disabled:text-white/60",
  ghost:
    "border border-border text-text hover:border-accent/60 hover:bg-accent-soft disabled:opacity-40",
  subtle: "text-muted hover:bg-surface-2 hover:text-text disabled:opacity-40",
};

export function Button({
  variant = "ghost",
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
