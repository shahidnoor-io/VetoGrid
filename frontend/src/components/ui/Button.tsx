import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "cyan" | "cit";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "cit", size = "md", isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#236B8E] disabled:pointer-events-none disabled:opacity-50 select-none rounded-lg";

    const variantStyles = {
      cit:
        "bg-[#236B8E] hover:bg-[#1B5270] text-white shadow-sm active:bg-[#143E55]",
      primary:
        "bg-[#236B8E] hover:bg-[#1B5270] text-white shadow-sm active:bg-[#143E55]",
      secondary:
        "bg-[#F1F5F9] hover:bg-[#E2E8F0] text-slate-700 border border-slate-200",
      outline:
        "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm",
      ghost:
        "bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900",
      danger:
        "bg-rose-600 hover:bg-rose-500 text-white shadow-sm active:bg-rose-700",
      cyan:
        "bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm active:bg-cyan-700",
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
