import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "cyan" | "cit" | "brown";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B08401] disabled:pointer-events-none disabled:opacity-50 select-none rounded-xl";

    const variantStyles = {
      cit:
        "bg-[#B08401] hover:bg-[#966F01] text-white shadow-sm active:bg-[#745501]",
      primary:
        "bg-[#B08401] hover:bg-[#966F01] text-white shadow-sm active:bg-[#745501]",
      brown:
        "bg-[#683B2B] hover:bg-[#563124] text-white shadow-sm active:bg-[#42261C]",
      secondary:
        "bg-[#FAF3F1] hover:bg-[#F3E5E0] text-[#683B2B] border border-[#EAC8BF]",
      outline:
        "border border-[#DED1BD] bg-white hover:bg-[#FAF6F2] text-[#683B2B] shadow-2xs",
      ghost:
        "bg-transparent hover:bg-[#FAF6F2] text-[#683B2B]",
      danger:
        "bg-rose-600 hover:bg-rose-500 text-white shadow-sm active:bg-rose-700",
      cyan:
        "bg-[#B08401] hover:bg-[#966F01] text-white shadow-sm active:bg-[#745501]",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-9 px-4 text-xs gap-2",
      lg: "h-11 px-6 text-sm gap-2.5",
      icon: "h-8 w-8 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
