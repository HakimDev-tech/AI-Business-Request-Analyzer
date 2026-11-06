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
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-[10px] border text-[12px] font-semibold tracking-[-.01em] transition-[background,border-color,color,box-shadow,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#91a96e] focus-visible:ring-offset-2 active:translate-y-px disabled:pointer-events-none disabled:opacity-45",
        size === "default" && "min-h-11 px-[17px]",
        size === "small" && "min-h-9 px-3 text-[11px]",
        size === "icon" && "size-9 p-0",
        variant === "primary" &&
          "border-[#18241f] bg-[#18241f] text-[#f7f7ef] shadow-[0_2px_0_rgba(24,36,31,.12)] hover:border-[#2c4438] hover:bg-[#2c4438]",
        variant === "secondary" &&
          "border-[#d6d9cf] bg-white text-[#28362e] hover:border-[#aeb9a8] hover:bg-[#f7f8f2]",
        variant === "ghost" &&
          "border-transparent bg-transparent text-[#667168] hover:border-[#e0e3da] hover:bg-[#f0f1ea] hover:text-[#18241f]",
        variant === "danger" &&
          "border-[#e8cbc5] bg-[#fff8f5] text-[#a94f48] hover:border-[#d9aaa0] hover:bg-[#fff0eb]",
        className
      )}
      {...props}
    />
  );
}