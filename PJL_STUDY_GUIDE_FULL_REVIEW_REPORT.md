# Python·Java·Linux 학습하기 전면 보강 검토 보고서

## 작업 범위

- Python 150문항 학습하기 전면 보강
- Java 150문항 학습하기 전면 보강
- Linux 120문항 학습하기 전면 보강
- Python 12번 해설의 `type(a).__name__` 설명 명확화

## 보강 기준

학습하기는 정답을 바로 말하는 해설이 아니라, 문제 풀이 전에 필요한 개념을 제공하는 영역으로 정리했다. 각 문항은 다음 구조를 유지한다.

1. 문제 해석 구조
2. 이론 설명
3. 풀이 접근 순서
4. 주의할 점

## 검토 기준

- 문제를 풀 수 있을 정도의 개념을 제공하는가
- 특정 문항의 정답을 노골적으로 찍어 주지 않는가
- 비슷한 유형에도 적용 가능한 학습 내용인가
- 출력 형식, 생성자 흐름, 경로 계산, 권한 계산처럼 실수하기 쉬운 지점을 포함했는가

## 주요 보강 예시

### Python

- `print()`의 `end`, `sep`, `\n` 처리
- `type()`과 `.__name__`의 차이
- 문자열 슬라이싱, 리스트 변경, 딕셔너리 `items()`/`pop()`
- 조건문, 반복문, 함수 `return`, 오류 유형

### Java

- `print`와 `println`
- 문자열 결합과 숫자 연산 차이
- `String`의 `==`와 `equals()`
- 생성자, `this()`, `super()`, 상속 호출 순서
- 인터페이스 `implements`, 오버로딩/오버라이딩, 다형성

### Linux

- 기본 명령어 목적별 분류
- 절대경로와 상대경로 계산
- 파일/디렉터리 조작 명령어 구분
- `chmod` 숫자 권한 계산
- `sudo`, `man`, `export`, `which`
- `ps/top/kill`, `df/du`, `ping/ip/ifconfig` 계열 구분

## 최종 검토 결과

- Python·Java·Linux 총 420개 학습하기 항목이 모두 존재하는지 확인했다.
- 각 학습하기 항목의 필수 필드(title, subtitle, conceptLabel, structureTitle, structure, theory, approach, cautions)가 누락되지 않았는지 확인했다.
- Python 12번 해설에 `.__name__` 설명이 포함되어 있는지 확인했다.
