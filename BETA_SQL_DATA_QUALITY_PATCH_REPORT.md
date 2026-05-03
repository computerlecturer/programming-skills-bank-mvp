# BETA SQL DATA QUALITY PATCH REPORT

## 반영 내용

1. SQL 136번 추가 정답 반영
- `LEFT JOIN`
- `LEFT OUTER JOIN`

2. 테이블 데이터가 지나치게 적어 결과가 바로 보이는 문제 수정
- 124, 128, 131, 135
- 137, 140, 144, 148
- 152, 153, 157, 160
- 192, 196

3. 수정 방향
- 각 테이블을 최소 3~5행 이상으로 확장
- 불일치 코드, NULL 발생, 중복값, 조건 필터링 요소 추가
- ORDER BY가 단순히 기존 순서와 같아지는 문제를 줄임
- INNER JOIN, LEFT JOIN, SELF JOIN, UNION, UNION ALL 결과를 직접 추적해야 풀 수 있도록 조정

## 수정 파일
- `src/data/sql_200_questions_platform_student_final_reviewed.json`
- `src/data/sql_200_questions_platform_reviewed.json`
