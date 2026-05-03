"use client";

import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Question, TableAnswer, UserAnswer } from "@/types/question";

type Props = {
  question: Question;
  value: UserAnswer;
  onChange: (value: UserAnswer) => void;
  disabled?: boolean;
};

function isTableAnswer(value: UserAnswer): value is TableAnswer {
  return typeof value === "object" && value !== null && !Array.isArray(value) && "columns" in value && "rows" in value;
}

function normalizeStructuredTable(value: UserAnswer): TableAnswer {
  // 이전 버전에서 저장된 string[][] 답안은 행 데이터로만 변환해 호환한다.
  if (Array.isArray(value)) {
    const columnCount = Math.max(value[0]?.length ?? 1, 1);
    return {
      columns: Array.from({ length: columnCount }, () => ""),
      rows: value.length ? value.map((row) => Array.from({ length: columnCount }, (_, index) => row[index] ?? "")) : [Array.from({ length: columnCount }, () => "")]
    };
  }

  if (isTableAnswer(value)) {
    const columnCount = Math.max(value.columns.length, 1);
    const columns = value.columns.length ? [...value.columns] : [""];
    const rows = value.rows.length ? value.rows.map((row) => Array.from({ length: columnCount }, (_, index) => row[index] ?? "")) : [Array.from({ length: columnCount }, () => "")];
    return { columns, rows };
  }

  return { columns: [""], rows: [[""]] };
}

export function AnswerInput({ question, value, onChange, disabled }: Props) {
  if (question.type === "result-table") {
    const tableValue = normalizeStructuredTable(value);
    const columnCount = Math.max(tableValue.columns.length, 1);

    const emit = (next: TableAnswer) => {
      const safeColumnCount = Math.max(next.columns.length, 1);
      onChange({
        columns: next.columns.length ? next.columns : [""],
        rows: next.rows.length
          ? next.rows.map((row) => Array.from({ length: safeColumnCount }, (_, index) => row[index] ?? ""))
          : [Array.from({ length: safeColumnCount }, () => "")]
      });
    };

    const updateColumn = (columnIndex: number, nextValue: string) => {
      const nextColumns = [...tableValue.columns];
      nextColumns[columnIndex] = nextValue;
      emit({ ...tableValue, columns: nextColumns });
    };

    const updateCell = (rowIndex: number, columnIndex: number, nextValue: string) => {
      const nextRows = tableValue.rows.map((row) => [...row]);
      nextRows[rowIndex][columnIndex] = nextValue;
      emit({ ...tableValue, rows: nextRows });
    };

    const addColumn = () => {
      emit({
        columns: [...tableValue.columns, ""],
        rows: tableValue.rows.map((row) => [...row, ""])
      });
    };

    const removeColumn = () => {
      if (tableValue.columns.length <= 1) return;
      emit({
        columns: tableValue.columns.slice(0, -1),
        rows: tableValue.rows.map((row) => row.slice(0, -1))
      });
    };

    const addRow = () => {
      emit({
        ...tableValue,
        rows: [...tableValue.rows, Array.from({ length: columnCount }, () => "")]
      });
    };

    const removeRow = () => {
      if (tableValue.rows.length <= 1) return;
      emit({ ...tableValue, rows: tableValue.rows.slice(0, -1) });
    };

    const resetTable = () => emit({ columns: [""], rows: [[""]] });

    return (
      <div className="space-y-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-sm font-black text-slate-950">결과표 직접 작성</div>
            <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
              정답의 컬럼명과 행 개수는 미리 표시하지 않습니다. SQL 실행 결과를 생각해 열과 행을 직접 추가하세요.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={disabled} onClick={addColumn} className="inline-flex h-9 items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-3 text-xs font-black text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50">
              <Plus className="size-3.5" /> 열 추가
            </button>
            <button type="button" disabled={disabled || tableValue.columns.length <= 1} onClick={removeColumn} className="inline-flex h-9 items-center gap-1 rounded-full border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
              <Trash2 className="size-3.5" /> 열 삭제
            </button>
            <button type="button" disabled={disabled} onClick={addRow} className="inline-flex h-9 items-center gap-1 rounded-full border border-violet-100 bg-violet-50 px-3 text-xs font-black text-violet-700 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50">
              <Plus className="size-3.5" /> 행 추가
            </button>
            <button type="button" disabled={disabled || tableValue.rows.length <= 1} onClick={removeRow} className="inline-flex h-9 items-center gap-1 rounded-full border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
              <Trash2 className="size-3.5" /> 행 삭제
            </button>
            <button type="button" disabled={disabled} onClick={resetTable} className="inline-flex h-9 items-center gap-1 rounded-full border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
              <RotateCcw className="size-3.5" /> 초기화
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-[1.25rem] border border-slate-200 bg-slate-50">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr className="bg-slate-950 text-white">
                {tableValue.columns.map((column, columnIndex) => (
                  <th key={`column-${columnIndex}`} className="border-r border-slate-800 p-2 last:border-r-0">
                    <Input
                      value={column}
                      onChange={(event) => updateColumn(columnIndex, event.target.value)}
                      disabled={disabled}
                      placeholder={`${columnIndex + 1}열 컬럼명`}
                      className="h-10 border-slate-700 bg-slate-900 font-black text-white placeholder:text-slate-500 focus-visible:bg-slate-900"
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableValue.rows.map((row, rowIndex) => (
                <tr key={`row-${rowIndex}`} className="bg-white">
                  {tableValue.columns.map((_, columnIndex) => (
                    <td key={`cell-${rowIndex}-${columnIndex}`} className="border-b border-r border-slate-100 p-2 last:border-r-0">
                      <Input
                        value={row[columnIndex] ?? ""}
                        onChange={(event) => updateCell(rowIndex, columnIndex, event.target.value)}
                        disabled={disabled}
                        placeholder={`${rowIndex + 1}행 ${columnIndex + 1}열 값`}
                        className="h-11 border-slate-200 bg-slate-50 font-semibold focus-visible:bg-white"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-2 text-xs font-semibold text-slate-500 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 px-3 py-2">현재 열: <span className="font-black text-slate-950">{tableValue.columns.length}</span>개</div>
          <div className="rounded-2xl bg-slate-50 px-3 py-2">현재 행: <span className="font-black text-slate-950">{tableValue.rows.length}</span>개</div>
          <div className="rounded-2xl bg-slate-50 px-3 py-2">컬럼명도 채점 대상입니다.</div>
        </div>
      </div>
    );
  }


  if (question.type === "choice") {
    const currentValue = typeof value === "string" ? value : "";
    const options = question.choiceOptions ?? [];

    return (
      <div className="space-y-3">
        {options.map((option, index) => {
          const selected = currentValue === option;
          return (
            <button
              key={`${option}-${index}`}
              type="button"
              disabled={disabled}
              onClick={() => onChange(option)}
              className={
                selected
                  ? "flex w-full items-start gap-3 rounded-2xl border-2 border-blue-500 bg-blue-50 p-4 text-left text-sm font-bold text-blue-900 shadow-sm transition disabled:cursor-not-allowed disabled:opacity-70"
                  : "flex w-full items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left text-sm font-semibold text-slate-800 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/60 disabled:cursor-not-allowed disabled:opacity-70"
              }
            >
              <span className={selected ? "flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white" : "flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-600"}>
                {index + 1}
              </span>
              <span className="leading-6">{option}</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (question.type === "short") {
    return (
      <Input
        value={typeof value === "string" ? value : ""}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        placeholder="정답을 입력하세요."
        className="h-[52px] rounded-2xl border-slate-200 bg-slate-50 px-4 text-base font-semibold shadow-inner focus-visible:bg-white"
      />
    );
  }

  return (
    <Textarea
      value={typeof value === "string" ? value : ""}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      placeholder={question.type === "sql" ? "SQL 코드를 입력하세요." : "답안을 입력하세요."}
      className={question.type === "sql" ? "min-h-[12rem] rounded-2xl border-slate-200 bg-slate-950 p-5 font-mono text-sm leading-7 text-slate-100 shadow-inner placeholder:text-slate-500" : "min-h-[10rem] rounded-2xl border-slate-200 bg-slate-50 p-5 text-base leading-7 shadow-inner focus-visible:bg-white"}
    />
  );
}
