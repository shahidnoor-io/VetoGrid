import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "danger" | "cyan" | "purple" | "blue" | "outline" | "cit" | "accessible" | "gold" | "rose" | "brown";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-[#F3EFE7] text-[#683B2B] border-[#DED1BD]",
    secondary: "bg-[#FAF3F1] text-[#683B2B] border-[#EAC8BF]",
    cit: "bg-[#FBF6EA] text-[#745501] border-[#ECD693]",
    gold: "bg-[#FBF6EA] text-[#745501] border-[#ECD693]",
    rose: "bg-[#FAF3F1] text-[#683B2B] border-[#EAC8BF]",
    brown: "bg-[#F7F2F0] text-[#683B2B] border-[#DCC4BB]",
    accessible: "bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    warning: "bg-[#FBF6EA] text-[#745501] border-[#ECD693]",
    danger: "bg-rose-50 text-rose-800 border-rose-200",
    cyan: "bg-[#FBF6EA] text-[#745501] border-[#ECD693]",
    purple: "bg-[#FAF3F1] text-[#683B2B] border-[#EAC8BF]",
    blue: "bg-[#F3EFE7] text-[#683B2B] border-[#DED1BD]",
    outline: "text-[#683B2B] border-[#DED1BD] bg-[#FAF6F2]",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
