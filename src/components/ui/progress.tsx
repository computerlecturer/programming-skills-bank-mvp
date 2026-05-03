import { cn } from "@/lib/utils";

export function Progress({ value, className, indicatorClassName }: { value: number; className?: string; indicatorClassName?: string }) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-2.5 overflow-hidden rounded-full bg-slate-100", className)}>
      <div
        className={cn("h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-600 transition-all duration-500", indicatorClassName)}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}
