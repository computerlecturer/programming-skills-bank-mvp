# 학습하기 이론 콘텐츠 검토 보고서

## 생성 범위

- sql: 200문항
- python: 150문항
- java: 150문항
- linux: 120문항
- 전체: 620문항

## 검토 기준

- 정답을 직접 노출하지 않고, 문제를 풀기 위한 개념·구조·접근 순서를 설명하도록 구성했습니다.
- 제목은 과목과 문제 번호가 다르게 표시되도록 구성했습니다.
- SQL은 SELECT, WHERE, LIKE, GROUP BY, JOIN, 서브쿼리, 집합연산, DML, DDL, VIEW/INDEX/DCL 등으로 나누어 설명이 달라지도록 했습니다.
- Python, Java, Linux는 단원별 핵심 개념을 기준으로 학생이 코드/명령어를 해석하는 순서를 설명하도록 했습니다.
- 모든 학습하기 데이터는 웹사이트 확장 시 DB로 옮기기 쉽도록 JSON 파일로 분리했습니다.

## SQL 개념 분류

- subquery: 31문항
- where: 23문항
- group: 21문항
- delete_drop: 21문항
- join: 16문항
- outer_join: 15문항
- insert: 12문항
- like: 11문항
- update: 11문항
- set: 11문항
- view_index_dcl: 11문항
- ddl_constraint: 9문항
- select: 8문항

## 자동 점검 결과

- 필수 필드 누락 없음
- 모든 문항에 학습하기 콘텐츠 생성 완료
- 긴 정답 문장/SQL이 학습 이론 안에 그대로 노출되는 문제 없음

## 운영 메모

이 파일은 현재는 프론트에서 import하여 사용하지만, Supabase 연동 후에는 `study_guides` 테이블로 옮겨 문제별 학습 자료로 관리할 수 있습니다.