import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-[12px] font-semibold tracking-wide uppercase text-slate-600"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          "h-11 sm:h-10 w-full rounded-lg border bg-white px-3.5",
          // 16px on mobile prevents iOS auto-zoom; 14px on desktop for density
          "text-[16px] sm:text-sm text-slate-900",
          "border-slate-200 placeholder:text-slate-400",
          "focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-amber-600",
          "transition-shadow",
          "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500",
          error && "border-red-400 focus:ring-red-400/40 focus:border-red-500",
          className
        )}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={
          error ? `${id}-error` : hint ? `${id}-hint` : undefined
        }
        {...props}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-slate-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-600 font-medium">
          {error}
        </p>
      )}
    </div>
  )
);
Input.displayName = "Input";
