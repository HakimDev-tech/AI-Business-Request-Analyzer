import * as React from "react";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "default" | "small" | "icon";
};

export function Button({
  className,
  variant = "primary",
  size = "default",
  type = "button",
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 border font-semibold tracking-[-.01em] transition-[background,border-color,color,box-shadow,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bc7658] focus-visible:ring-offset-2 active:translate-y-px disabled:pointer-events-none disabled:opacity-45",
        size === "default" && "min-h-11 rounded-[8px_2px_8px_2px] px-[17px] text-[12px]",
        size === "small" && "min-h-9 rounded-[7px_2px_7px_2px] px-3 text-[11px]",
        size === "icon" && "size-9 rounded-[9px_2px_9px_2px] p-0 text-[11px]",
        variant === "primary" && "border-[#bc5034] bg-[#bc5034] text-white shadow-[0_2px_0_rgba(91,44,31,.12)] hover:border-[#943d2b] hover:bg-[#943d2b]",
        variant === "secondary" && "border-[#cbd9d2] bg-white text-[#294642] hover:border-[#97b6a9] hover:bg-[#f4f8f4]",
        variant === "ghost" && "border-transparent bg-transparent text-[#697c75] hover:border-[#d6e1dc] hover:bg-[#f1f6f2] hover:text-[#203a39]",
        variant === "danger" && "border-[#e7c9bc] bg-[#fff8f3] text-[#ad4e41] hover:border-[#d7aa99] hover:bg-[#fbece5]",
        className
      )}
      {...props}
    />
  );
}