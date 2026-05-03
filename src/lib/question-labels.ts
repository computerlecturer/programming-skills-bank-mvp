import type { QuestionType } from "@/types/question";

export const questionTypeLabel: Record<QuestionType, string> = {
  short: "단답형",
  text: "서술·실행결과형",
  choice: "객관식",
  sql: "SQL 작성형",
  "result-table": "결과표 작성형"
};

export const questionTypeDescription: Record<QuestionType, string> = {
  short: "짧은 명령어, 키워드, 값 등을 입력하는 문제",
  text: "실행 결과나 오류 원인처럼 문장 또는 여러 줄로 답하는 문제",
  choice: "제시된 보기 중 하나를 선택하는 문제",
  sql: "조건에 맞는 SQL문을 직접 작성하는 문제",
  "result-table": "SQL 실행 결과를 표 형태로 직접 구성하는 문제"
};

export function getQuestionTypeLabel(type: QuestionType) {
  return questionTypeLabel[type] ?? type;
}
