import { cn } from "@/lib/utils";

const variants = {
  default: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200",
  success: "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200",
  warning: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
  danger: "bg-red-50 text-red-800 ring-1 ring-inset ring-red-200",
  info: "bg-blue-50 text-blue-800 ring-1 ring-inset ring-blue-200",
  closed: "bg-slate-900 text-white ring-1 ring-inset ring-slate-900",
  open: "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-300",
  gold: "bg-amber-50 text-amber-900 ring-1 ring-inset ring-amber-300",
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
