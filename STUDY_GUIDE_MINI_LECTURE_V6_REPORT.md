# STUDY_GUIDE_MINI_LECTURE_V6_REPORT

## 수정 목적

학습하기를 정답 해설이 아니라 학생이 문제로 돌아가 스스로 풀 수 있게 돕는 **문항별 미니 강의형 구조**로 다시 작성했습니다. 자동 템플릿처럼 보이는 문장을 줄이기 위해 각 문항의 지문, 코드, 단원, 문제 유형, 핵심 표현을 반영했습니다.

## 반영 내용

- 문제 본문, 정답, 해설, 선택지는 수정하지 않았습니다.
- `src/data/study_guides_reviewed.json` 620개를 재생성했습니다.
- 학습 팝업 문구를 `이 문제는 무엇을 묻나요?`, `정답과 다른 비슷한 예시` 중심으로 정리했습니다.
- Linux는 기존 공통 도감을 유지하고 제목을 `Linux 필수 명령어·문제도감`으로 강화했습니다.
- SQL은 GROUP BY와 HAVING을 구분하고, SQL 작성형/실행 결과표형/단답형을 나누어 설명했습니다.
- Python은 코드 실행 순서, 자료형, 인덱싱, 반복, 함수, 오류 수정 등을 코드 단서 기준으로 분류했습니다.
- Java는 논리연산자, 반복문, 배열, 문자열 비교, 생성자, 상속, 인터페이스 등을 코드 단서 기준으로 재분류했습니다.
- Linux 개별 학습은 명령어, 경로, 권한, 파일 내용, 파일 관리, 시스템/네트워크로 분류했습니다.

## 개수 검증

| 과목 | 문항 수 | 예시 고유 수 | 자세한 이론 고유 수 |
|---|---:|---:|---:|
| sql | 200 | 200 | 174 |
| python | 150 | 150 | 150 |
| java | 150 | 150 | 148 |
| linux | 120 | 120 | 120 |


전체 학습하기 수: 620개

## 자동 검수 결과

- JSON 파싱: 정상
- 전체 학습하기 수: 620개 유지
- Linux 학습하기: 120개 모두 공통 도감 UI 사용
- 직접 정답 문자열 포함 의심 항목: 51개

직접 정답 문자열 검사는 긴 정답 문자열 기준의 기계 검사입니다. 숫자 한 글자, 짧은 명령어, 단일 키워드는 일반 이론 설명과 구분이 어려워 자동 검출 대상에서 제외했습니다.

## 남은 주의점

이번 v6는 문항별 지문과 코드 단서를 반영해 기존 v4/v5보다 템플릿 반복을 줄인 버전입니다. 다만 620개를 전부 사람이 수작업으로 집필한 것은 아니므로, 실제 배포 전에는 과목별 대표 문항과 난도 높은 문항을 화면에서 다시 확인하는 것이 안전합니다.

## 직접 정답 포함 의심 샘플

- sql:53: acceptedAnswer text appears
- sql:57: acceptedAnswer text appears
- sql:63: acceptedAnswer text appears
- sql:65: acceptedAnswer text appears
- sql:72: acceptedAnswer text appears
- sql:82: acceptedAnswer text appears
- sql:88: acceptedAnswer text appears
- sql:101: acceptedAnswer text appears
- sql:111: acceptedAnswer text appears
- sql:115: acceptedAnswer text appears
- sql:130: acceptedAnswer text appears
- sql:134: acceptedAnswer text appears
- sql:138: acceptedAnswer text appears
- sql:143: acceptedAnswer text appears
- sql:147: acceptedAnswer text appears
- sql:154: acceptedAnswer text appears
- sql:156: acceptedAnswer text appears
- sql:158: acceptedAnswer text appears
- sql:167: acceptedAnswer text appears
- sql:172: acceptedAnswer text appears
