import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "destructive" | "premium" | "dark";
type ButtonSize = "sm" | "md" | "lg" | "xl" | "icon";

const variants: Record<ButtonVariant, string> = {
  default: "bg-blue-600 text-white shadow-[0_16px_40px_rgba(37,99,235,0.22)] hover:bg-blue-700",
  premium: "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-[0_18px_46px_rgba(79,70,229,0.28)] hover:brightness-110",
  dark: "bg-slate-950 text-white shadow-[0_16px_40px_rgba(15,23,42,0.20)] hover:bg-slate-800",
  secondary: "bg-slate-100 text-slate-950 hover:bg-slate-200",
  outline: "border border-slate-200 bg-white/90 text-slate-950 shadow-sm hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-700",
  ghost: "text-slate-700 hover:bg-slate-100",
  destructive: "bg-red-600 text-white hover:bg-red-700"
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base",
  xl: "h-14 px-7 text-base",
  icon: "h-10 w-10"
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({ className, variant = "default", size = "md", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl font-bold tracking-[-0.01em] transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

type ButtonLinkProps = React.ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

export function ButtonLink({ className, variant = "default", size = "md", ...props }: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl font-bold tracking-[-0.01em] transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
