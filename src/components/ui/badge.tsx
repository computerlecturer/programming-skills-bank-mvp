import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "outline" | "success" | "warning" | "dark" | "premium" | "danger";

const variants: Record<BadgeVariant, string> = {
  default: "bg-blue-100 text-blue-800 ring-blue-200/60",
  secondary: "bg-slate-100 text-slate-700 ring-slate-200/80",
  outline: "border border-slate-200 bg-white text-slate-700 ring-transparent",
  success: "bg-emerald-100 text-emerald-800 ring-emerald-200/70",
  warning: "bg-amber-100 text-amber-800 ring-amber-200/70",
  danger: "bg-red-100 text-red-800 ring-red-200/70",
  dark: "bg-slate-950 text-white ring-slate-800",
  premium: "bg-gradient-to-r from-blue-600 to-violet-600 text-white ring-blue-400/30"
};

export function Badge({ className, variant = "default", ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1", variants[variant], className)} {...props} />;
}
