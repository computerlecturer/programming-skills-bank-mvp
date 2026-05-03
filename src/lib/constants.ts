export const SERVICE_VERSION = "v7.4.3-deployment-docs";

// 베타 회원제 정책
// 비회원은 과목별 50문항까지 무료 이용, 로그인 회원은 베타 기간 전체 문제 이용 가능
export const FREE_LIMIT = 50;
export const FREE_LIMIT_PER_SUBJECT = 50;
export const BETA_UNLOCK_ALL = false;
export const BETA_MEMBERS_FULL_ACCESS = true;
export const BETA_PAYMENTS_ENABLED = false;

// 향후 유료 전환 대비 정책값: 현재 UI에서는 결제를 유도하지 않음
export const PAID_ACCESS_DAYS = 30;
export const PAID_PLAN_CODE = "full_bank_30d";
export const PAID_PLAN_NAME = "전체 문제은행 30일 이용권";

// AI 문제 변형 정책: 베타 기간에는 관리자만 테스트 가능
export const AI_DAILY_LIMIT = 20;
export const AI_ADMIN_ONLY_BETA = true;
export const AI_READY_MESSAGE = "서비스 준비중입니다.";
export const AI_VARIATION_MODES = ["same_level", "harder"] as const;
export type AiVariationMode = (typeof AI_VARIATION_MODES)[number];

export const AI_VARIATION_MODE_LABEL: Record<AiVariationMode, string> = {
  same_level: "현재 난이도 유지",
  harder: "난이도 높이기"
};
