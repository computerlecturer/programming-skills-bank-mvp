import type { Question, TableAnswer, UserAnswer } from "@/types/question";

function stripTrailingSemicolon(value: string) {
  return value.replace(/;+\s*$/g, "");
}

function normalizeCase(value: string, question: Question) {
  return question.gradingPolicy?.caseSensitive === true ? value : value.toLowerCase();
}

function isKoreanSentence(value: string) {
  const text = (value ?? "").trim();
  return /[가-힣]/.test(text) && !/[A-Za-z0-9_/*=<>+\-`'"()[\]{}]/.test(text);
}


function isPythonCollectionLike(value: string, question: Question) {
  return question.subject === "python" && /[\[\]{}()]/.test(value ?? "") && /[,:"]|[']/.test(value ?? "");
}

function normalizePythonCollectionSpacing(value: string, question: Question) {
  if (!isPythonCollectionLike(value, question)) return value;

  let result = "";
  let quote: "'" | '"' | null = null;

  for (let i = 0; i < value.length; i += 1) {
    const char = value[i];
    const prev = value[i - 1];

    if (quote) {
      result += char;
      if (char === quote && prev !== "\\") quote = null;
      continue;
    }

    if (char === "'" || char === '"') {
      quote = char;
      result += char;
      continue;
    }

    // Python 리스트/튜플/딕셔너리 출력형에서는 구분자 주변 공백 차이를 채점에서 무시한다.
    // 단, 문자열 내부 공백은 위 quote 상태에서 그대로 보존된다.
    if (/\s/.test(char)) {
      const before = result[result.length - 1] ?? "";
      let j = i + 1;
      while (j < value.length && /\s/.test(value[j])) j += 1;
      const after = value[j] ?? "";
      if (/[\[\]{}(),:]/.test(before) || /[\[\]{}(),:]/.test(after)) {
        continue;
      }
      result += " ";
      i = j - 1;
      continue;
    }

    result += char;
  }

  return result;
}

function normalizeGeneralSpacing(value: string, question: Question, accepted?: string) {
  let normalized = (value ?? "").replace(/\r\n/g, "\n").trim();
  if (question.gradingPolicy?.ignoreSemicolon !== false) normalized = stripTrailingSemicolon(normalized);

  // 한글 설명형 답안은 띄어쓰기 차이를 허용한다.
  if (accepted && isKoreanSentence(accepted)) {
    normalized = normalized.replace(/\s+/g, "");
  } else if (question.gradingPolicy?.ignoreWhitespace === true) {
    // 명시적으로 완전 공백 무시가 지정된 문항만 모든 공백을 제거한다.
    normalized = normalized.replace(/\s+/g, "");
  } else {
    // 기본값: 앞뒤 공백/연속 공백 차이는 허용하지만, 필요한 토큰 사이 공백은 유지한다.
    normalized = normalized.replace(/[ \t]+/g, " ");
  }

  normalized = normalizePythonCollectionSpacing(normalized, question);
  return normalizeCase(normalized, question);
}

function normalizeSqlOutsideQuotes(segment: string, question: Question) {
  let normalized = question.gradingPolicy?.caseSensitive === true ? segment : segment.toLowerCase();
  normalized = normalized.replace(/\s+/g, " ").trim();

  // 괄호, 쉼표, 비교/산술 연산자 주변 공백은 의미 없는 표기 차이로 본다.
  normalized = normalized.replace(/\s*([(),=<>+\-*\/])\s*/g, "$1");

  // SELECT * FROM 처럼 별표 앞뒤 공백은 허용하되, ORDER BY/GROUP BY 같은 토큰 사이 공백은 유지한다.
  normalized = normalized.replace(/\s+/g, " ").trim();
  return normalized;
}

function normalizeSql(value: string, question: Question) {
  const text = stripTrailingSemicolon((value ?? "").replace(/\r\n/g, "\n").trim());
  const parts: string[] = [];
  let buffer = "";
  let quote: "'" | '"' | "`" | null = null;

  const flushOutside = () => {
    if (buffer) {
      parts.push(normalizeSqlOutsideQuotes(buffer, question));
      buffer = "";
    }
  };

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i] as "'" | '"' | "`" | string;
    const prev = text[i - 1];

    if (!quote && (char === "'" || char === '"' || char === "`")) {
      flushOutside();
      quote = char;
      buffer = char;
      continue;
    }

    if (quote) {
      buffer += char;
      if (char === quote && prev !== "\\") {
        parts.push(buffer);
        buffer = "";
        quote = null;
      }
      continue;
    }

    buffer += char;
  }

  if (quote) {
    // 닫히지 않은 따옴표는 입력 그대로 비교되도록 남긴다.
    parts.push(buffer);
  } else {
    flushOutside();
  }

  return parts.filter(Boolean).join("");
}

function normalizeLineSensitive(value: string, question: Question, accepted: string) {
  let normalized = (value ?? "").replace(/\r\n/g, "\n").trim();
  if (question.gradingPolicy?.ignoreSemicolon !== false) normalized = stripTrailingSemicolon(normalized);

  const acceptedLines = (accepted ?? "").replace(/\r\n/g, "\n").trim().split("\n");

  return normalizeCase(
    normalized
      .split("\n")
      .map((line, index) => {
        const acceptedLine = acceptedLines[index] ?? acceptedLines[0] ?? accepted;
        const trimmed = line.trim();
        if (isKoreanSentence(acceptedLine)) return trimmed.replace(/\s+/g, "");
        if (question.gradingPolicy?.ignoreWhitespace === true) return trimmed.replace(/\s+/g, "");
        return normalizePythonCollectionSpacing(trimmed.replace(/[ \t]+/g, " "), question);
      })
      .join("\n"),
    question
  );
}

function normalizeTextForAccepted(value: string, accepted: string, question: Question) {
  if (question.type === "sql") return normalizeSql(value, question);

  const normalizedAccepted = (accepted ?? "").replace(/\r\n/g, "\n");
  const shouldPreserveLineBreaks =
    question.gradingPolicy?.preserveLineBreaks === true ||
    question.type === "text" ||
    normalizedAccepted.includes("\n");

  if (shouldPreserveLineBreaks) return normalizeLineSensitive(value, question, accepted);
  return normalizeGeneralSpacing(value, question, accepted);
}

function normalizeCell(value: string, question: Question) {
  let normalized = (value ?? "").trim();
  if (question.gradingPolicy?.ignoreWhitespace === true) {
    normalized = normalized.replace(/\s+/g, "");
  } else {
    normalized = normalized.replace(/[ \t]+/g, " ");
  }
  return normalizeCase(normalized, question);
}

function normalizeColumn(value: string, question: Question) {
  let normalized = (value ?? "").trim();
  if (question.gradingPolicy?.ignoreColumnHeaderWhitespace === true) {
    normalized = normalized.replace(/\s+/g, "");
  } else {
    normalized = normalized.replace(/[ \t]+/g, " ");
  }
  return normalizeCase(normalized, question);
}

function isStructuredTableAnswer(answer: UserAnswer): answer is TableAnswer {
  return typeof answer === "object" && answer !== null && !Array.isArray(answer) && "columns" in answer && "rows" in answer;
}

function gradeText(question: Question, answer: string) {
  const acceptedAnswers = question.acceptedAnswers?.length
    ? question.acceptedAnswers
    : question.acceptedAnswer
      ? [question.acceptedAnswer]
      : [];

  return acceptedAnswers.some((accepted) => {
    return normalizeTextForAccepted(answer, accepted, question) === normalizeTextForAccepted(accepted, accepted, question);
  });
}

function gradeLegacyTable(question: Question, answer: string[][]) {
  const expected = question.acceptedTableRows ?? [];
  if (answer.length !== expected.length) return false;

  return expected.every((row, rowIndex) => {
    const userRow = answer[rowIndex] ?? [];
    if (userRow.length !== row.length) return false;

    return row.every((cell, cellIndex) => {
      return normalizeCell(userRow[cellIndex] ?? "", question) === normalizeCell(cell, question);
    });
  });
}

function gradeStructuredTable(question: Question, answer: TableAnswer) {
  const expectedColumns = question.outputColumns ?? [];
  const expectedRows = question.acceptedTableRows ?? [];

  if (expectedColumns.length && answer.columns.length !== expectedColumns.length) return false;
  if (answer.rows.length !== expectedRows.length) return false;

  if (expectedColumns.length) {
    const columnOk = expectedColumns.every((column, columnIndex) => {
      return normalizeColumn(answer.columns[columnIndex] ?? "", question) === normalizeColumn(column, question);
    });
    if (!columnOk) return false;
  }

  return expectedRows.every((row, rowIndex) => {
    const userRow = answer.rows[rowIndex] ?? [];
    if (userRow.length !== row.length) return false;

    return row.every((cell, cellIndex) => {
      return normalizeCell(userRow[cellIndex] ?? "", question) === normalizeCell(cell, question);
    });
  });
}

export function gradeQuestion(question: Question, answer: UserAnswer) {
  if (question.type === "result-table") {
    if (isStructuredTableAnswer(answer)) return gradeStructuredTable(question, answer);
    return Array.isArray(answer) && gradeLegacyTable(question, answer);
  }

  return typeof answer === "string" && gradeText(question, answer);
}

export function getDisplayAnswer(question: Question): string | TableAnswer {
  if (question.type === "result-table") {
    return {
      columns: question.outputColumns ?? [],
      rows: question.acceptedTableRows ?? []
    };
  }
  return question.acceptedAnswer ?? question.acceptedAnswers?.[0] ?? "";
}
