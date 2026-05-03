# 학습하기 620문항 전수 검토 및 재매칭 보고서

## 1. 검토 목적

기존 학습하기는 일부 문항에서 문제의 실제 핵심 문법과 예시가 어긋나는 문제가 있었습니다. 예를 들어 리스트 컴프리헨션 문제에 append/sort 예시가 나오거나, 조건문 문제에 문자열 비교 예시가 나오는 방식입니다. 이번 검토는 SQL, Python, Java, Linux 620문항 전체를 대상으로 문제 지문과 코드를 기준으로 학습하기 내용을 다시 맞춘 작업입니다.

## 2. 적용 원칙

- 학습하기는 정답 힌트가 아니라 문제 풀이 전 개념 학습이어야 합니다.
- 문제에 나온 코드, 숫자, 문자열, 테이블 값을 그대로 반복하지 않습니다.
- 같은 개념을 다른 값과 다른 상황으로 보여주는 예시를 사용합니다.
- 단원명만 보고 넣지 않고 실제 문제 코드, 명령어, SQL문, 요구사항을 기준으로 핵심 개념을 재분류했습니다.
- `핵심 개념 → 예시로 이해하기 → 문제 풀 때 확인할 순서 → 자주 하는 실수 → 자세히 보기` 구조에 맞추었습니다.

## 3. 검토 결과 요약

| 과목 | 문항 수 | 처리 결과 |
|---|---:|---|
| SQL | 200 | 전 문항 학습하기 핵심개념·예시·풀이순서 재매칭 |
| PYTHON | 150 | 전 문항 학습하기 핵심개념·예시·풀이순서 재매칭 |
| JAVA | 150 | 전 문항 학습하기 핵심개념·예시·풀이순서 재매칭 |
| LINUX | 120 | 전 문항 학습하기 핵심개념·예시·풀이순서 재매칭 |
| 전체 | 620 | 620문항 전수 검토 완료 |

## 4. 과목별 주요 검토 방향

### Python
print 옵션, 자료형과 형 변환, 문자열 메서드, 리스트 메서드, 리스트 컴프리헨션, 딕셔너리 items(), 조건문, 반복문, range/enumerate/zip, 함수/return, 오류 찾기, 실전 코드 흐름을 실제 코드 기준으로 재분류했습니다. 특히 `split()`, `join()`, `find()`, `replace()`, `lower()`, `items()`, `enumerate()`, `zip()`처럼 문제 풀이에 필요한 함수·메서드 설명이 학습하기에 빠지지 않도록 했습니다.

### Java
출력, 변수와 자료형, 연산자와 증감, 조건문/삼항 연산자, 반복문, 배열, 문자열 처리, 메서드/return, 클래스/객체, 생성자/this, 상속/super, 오버로딩/오버라이딩, 인터페이스/다형성, 오류/실전 흐름으로 재분류했습니다. 특히 Java 21번 이후 코드 형식 문제와, 조건문 문제에 문자열 예시가 들어가는 매칭 오류를 바로잡았습니다.

### Linux
기본 명령어, 경로 기호, 경로 계산, 파일·디렉터리 조회, 파일 조작, 파일 내용 확인, chmod 권한, 관리자/도움말/환경 변수, 프로세스·디스크·네트워크 명령으로 재분류했습니다. 명령어 암기형 문제와 경로 계산형 문제를 구분하여 예시가 문제 유형과 맞도록 조정했습니다.

### SQL
SELECT, WHERE, 논리조건/NULL, LIKE, ORDER BY/집계, GROUP BY/HAVING, INSERT, UPDATE, DELETE/TRUNCATE/DROP, 서브쿼리, IN/EXISTS, JOIN, OUTER/SELF JOIN, UNION, DDL, 제약조건, VIEW/INDEX/DCL, 실전 혼합 SQL로 재분류했습니다. SQL 예시는 실제 문제 테이블명과 값을 그대로 쓰지 않고 같은 문법의 다른 업무 상황 예시로 구성했습니다.

## 5. 대표 수정 예시

### Python 49번
- 실제 핵심: 리스트 컴프리헨션
- 조정 내용: 리스트 메서드 예시가 아니라 다른 값으로 구성된 컴프리헨션 예시 제공

```python
values = [3, 5, 7]
result = [v - 1 for v in values]
# 각 원소에 같은 계산을 적용해 새 리스트를 만듭니다.
```

### Java 35번
- 실제 핵심: 조건문과 삼항 연산자
- 조정 내용: 문자열 비교 예시 제거, 조건 분기 예시 제공

```java
int score = 75;
System.out.print(score >= 60 ? "pass" : "fail");
```

### Linux 경로/기호 문제
- 실제 핵심: 명령어 문제인지 경로 기호 문제인지 구분
- 조정 내용: 단순 명령어 예시가 아니라 경로 기호와 이동 예시로 재구성

```bash
cd ~
# 현재 사용자의 홈 디렉터리로 이동합니다.
```

### SQL JOIN 문제
- 실제 핵심: 테이블 연결 조건과 출력 컬럼 구분
- 조정 내용: 실제 문제 테이블을 반복하지 않고 다른 예시로 JOIN 구조 설명

```sql
SELECT s.이름, d.부서명
FROM 직원 s INNER JOIN 부서 d
ON s.부서코드 = d.부서코드;
```

## 6. 개념 분류별 문항 수

| 과목 | 개념 | 문항 수 |
|---|---|---:|
| JAVA | Java 메서드와 반환값 | 10 |
| JAVA | Java 문자열 처리 | 10 |
| JAVA | Java 반복문 | 10 |
| JAVA | Java 배열 | 10 |
| JAVA | Java 변수와 자료형 | 10 |
| JAVA | Java 상속과 super | 10 |
| JAVA | Java 생성자와 this | 10 |
| JAVA | Java 연산자와 증감 | 10 |
| JAVA | Java 오류 찾기와 실전 흐름 | 20 |
| JAVA | Java 오버로딩과 오버라이딩 | 10 |
| JAVA | Java 인터페이스와 다형성 | 10 |
| JAVA | Java 조건문과 삼항 연산자 | 10 |
| JAVA | Java 출력과 main 구조 | 10 |
| JAVA | Java 클래스와 객체 | 10 |
| LINUX | 경로 기호 | 13 |
| LINUX | 경로와 디렉터리 이동 | 20 |
| LINUX | 관리자·도움말·환경 변수 | 1 |
| LINUX | 권한과 chmod | 27 |
| LINUX | 기본 명령어 | 8 |
| LINUX | 파일 내용 확인 | 18 |
| LINUX | 파일·디렉터리 조작 | 16 |
| LINUX | 파일·디렉터리 조회 | 6 |
| LINUX | 프로세스·디스크·네트워크 | 11 |
| PYTHON | print 기본 출력 | 7 |
| PYTHON | print 옵션 end/sep/f-string | 3 |
| PYTHON | range enumerate zip | 10 |
| PYTHON | split/join/find/replace/in | 5 |
| PYTHON | 딕셔너리와 items | 10 |
| PYTHON | 리스트 인덱싱과 메서드 | 9 |
| PYTHON | 리스트 컴프리헨션 | 11 |
| PYTHON | 문자열 인덱싱·슬라이싱·메서드 | 15 |
| PYTHON | 반복문과 흐름 제어 | 10 |
| PYTHON | 변수 대입과 참조 | 3 |
| PYTHON | 비교·논리 연산 | 2 |
| PYTHON | 숫자 연산자와 우선순위 | 8 |
| PYTHON | 실전 코드 흐름 추적 | 10 |
| PYTHON | 오류 찾기와 예외 | 10 |
| PYTHON | 자료형 확인과 형 변환 | 7 |
| PYTHON | 조건문과 삼항 표현식 | 10 |
| PYTHON | 튜플과 set | 10 |
| PYTHON | 함수와 return | 10 |
| SQL | DDL CREATE ALTER DROP | 20 |
| SQL | GROUP BY와 HAVING | 5 |
| SQL | IN EXISTS | 15 |
| SQL | INNER JOIN | 15 |
| SQL | INSERT | 10 |
| SQL | LIKE와 문자열 패턴 | 10 |
| SQL | ORDER BY와 집계 | 7 |
| SQL | OUTER JOIN과 SELF JOIN | 15 |
| SQL | SELECT 기본 조회 | 8 |
| SQL | UNION과 집합연산 | 10 |
| SQL | UPDATE | 10 |
| SQL | VIEW INDEX DCL 데이터사전 | 10 |
| SQL | WHERE 조건식 | 8 |
| SQL | 논리 조건과 NULL | 13 |
| SQL | 서브쿼리 | 23 |
| SQL | 실전 혼합 SQL | 10 |
| SQL | 제약조건 | 11 |

## 7. 전수 검토표

문항별 번호, 장, 감지된 핵심 개념, 수정 사유는 `STUDY_GUIDE_620_ITEM_AUDIT_TABLE.csv`에 전체 포함했습니다.
