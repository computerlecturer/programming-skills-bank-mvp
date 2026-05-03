import type { SubjectColor } from "@/types/question";

export const subjectColorClass: Record<SubjectColor, {
  ring: string;
  bg: string;
  text: string;
  soft: string;
  progress: string;
  gradient: string;
  glow: string;
  border: string;
}> = {
  blue: {
    ring: "ring-blue-100",
    bg: "bg-blue-600",
    text: "text-blue-700",
    soft: "bg-blue-50 text-blue-700 ring-blue-100",
    progress: "from-blue-600 to-cyan-500",
    gradient: "from-blue-600 via-sky-500 to-cyan-400",
    glow: "shadow-blue-500/20",
    border: "border-blue-100"
  },
  emerald: {
    ring: "ring-emerald-100",
    bg: "bg-emerald-600",
    text: "text-emerald-700",
    soft: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    progress: "from-emerald-600 to-teal-400",
    gradient: "from-emerald-600 via-teal-500 to-cyan-400",
    glow: "shadow-emerald-500/20",
    border: "border-emerald-100"
  },
  amber: {
    ring: "ring-amber-100",
    bg: "bg-amber-500",
    text: "text-amber-700",
    soft: "bg-amber-50 text-amber-700 ring-amber-100",
    progress: "from-amber-500 to-orange-500",
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    glow: "shadow-amber-500/20",
    border: "border-amber-100"
  },
  violet: {
    ring: "ring-violet-100",
    bg: "bg-violet-600",
    text: "text-violet-700",
    soft: "bg-violet-50 text-violet-700 ring-violet-100",
    progress: "from-violet-600 to-fuchsia-500",
    gradient: "from-violet-600 via-fuchsia-500 to-pink-500",
    glow: "shadow-violet-500/20",
    border: "border-violet-100"
  }
};
