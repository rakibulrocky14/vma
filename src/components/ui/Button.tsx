import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

const variants = {
  primary:
    "bg-slate-900 text-white hover:bg-slate-800 active:bg-black disabled:bg-slate-300 shadow-sm",
  secondary:
    "bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 disabled:opacity-50",
  danger:
    "bg-red-700 text-white hover:bg-red-800 active:bg-red-900 disabled:bg-red-300 shadow-sm",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 disabled:opacity-50",
  success:
    "bg-emerald-700 text-white hover:bg-emerald-800 active:bg-emerald-900 disabled:bg-emerald-300 shadow-sm",
  gold:
    "bg-amber-700 text-white hover:bg-amber-800 active:bg-amber-900 disabled:bg-amber-300 shadow-sm",
};

// Mobile-first sizing: taller buttons on touch devices, denser on desktop.
const sizes = {
  // sm: 36px touch, 32px desktop — used in inline tools/secondary actions
  sm: "h-9 sm:h-8 px-3 text-[13px]",
  // md: 40px touch, 36px desktop — default size for forms
  md: "h-10 sm:h-9 px-4 text-[14px] sm:text-sm",
  // lg: 44px touch, 44px desktop — primary CTAs
  lg: "h-11 px-6 text-[15px]",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium tracking-tight",
        "transition-all duration-150 cursor-pointer select-none whitespace-nowrap",
        "disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
      {children}
    </button>
  )
);
Button.displayName = "Button";
