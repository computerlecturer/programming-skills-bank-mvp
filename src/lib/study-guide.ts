import studyGuidesRaw from "@/data/study_guides_reviewed.json";
import { getQuestionTypeLabel } from "@/lib/question-labels";
import type { Question } from "@/types/question";

export type StudyGuide = {
  title: string;
  subtitle: string;
  conceptLabel: string;
  structureTitle: string;
  structure: string[];
  theory: string[];
  approach: string[];
  cautions: string[];
  quickPoints?: string[];
  examples?: string[];
};

const studyGuides = studyGuidesRaw as Record<string, StudyGuide>;

function guideKey(question: Question) {
  return `${question.subject}:${question.questionNo}`;
}

function fallbackGuide(question: Question): StudyGuide {
  return {
    title: `${question.subjectName} ${question.questionNo}번 이론 학습`,
    subtitle: `${question.chapter} · ${getQuestionTypeLabel(question.type)}`,
    conceptLabel: "핵심 개념",
    structureTitle: "문제 해석 구조",
    structure: [
      "문제에서 요구하는 답안 형태를 먼저 확인합니다.",
      "지문에 제시된 조건, 표, 코드, 출력 형식을 분리해서 봅니다.",
      "답을 쓰기 전에 내가 판단해야 할 기준을 한 문장으로 정리합니다."
    ],
    theory: [
      "이 학습 내용은 정답을 직접 알려주는 힌트가 아니라, 문제를 풀기 전에 알아야 할 개념을 정리한 자료입니다.",
      "문제의 요구사항을 먼저 파악한 뒤, 조건과 출력 형식을 기준으로 답안을 작성해야 합니다.",
      "정답을 외우기보다 문제에서 어떤 근거를 찾아야 하는지 이해하는 것이 중요합니다."
    ],
    approach: [
      "문제의 핵심 요구사항을 표시합니다.",
      "제시된 자료에서 답안 작성에 필요한 근거를 찾습니다.",
      "답을 작성한 뒤 형식과 조건이 지문과 맞는지 확인합니다."
    ],
    cautions: [
      "정답을 외우기보다 문제에서 어떤 정보를 근거로 판단해야 하는지 확인하세요.",
      "공백, 줄바꿈, 컬럼명, 출력 순서처럼 형식이 중요한 문제는 마지막에 반드시 다시 확인하세요.",
      "실전 모드에서는 이론 학습 없이 바로 문제를 푸는 흐름으로 연습하세요."
    ]
  };
}

export function getStudyGuide(question: Question): StudyGuide {
  return studyGuides[guideKey(question)] ?? fallbackGuide(question);
}
