import type { AiVariationMode } from "@/lib/constants";
import type { SubjectId } from "@/types/question";

export type ServiceUser = {
  id: string;
  email: string;
  name?: string;
  provider: "email";
  role?: "user" | "admin";
  createdAt: string;
};

export type UserEntitlement = {
  id: string;
  userId: string;
  planCode: string;
  status: "active" | "expired" | "cancelled";
  startsAt: string;
  expiresAt: string;
  createdAt: string;
};

export type AiUsageLog = {
  id: string;
  userId: string;
  subject: SubjectId;
  questionNo: number;
  mode: AiVariationMode;
  usedDate: string;
  createdAt: string;
};
