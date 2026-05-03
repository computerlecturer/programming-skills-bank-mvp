# Java 6·7번 문제 수정 보고서

## 수정 배경

기존 Java 6번과 7번은 학생 입장에서 실기형 문제로 보기 어려운 단편 암기형 문항이었습니다.

- 6번: `public ( ) void main` 빈칸에 `static`을 쓰는 단순 키워드 암기형 문항
- 7번: `System.out.print("Hello")`에서 화면 출력에 사용하는 클래스 이름을 묻는 문항

두 문항 모두 Java 기본 구조를 익히는 데 일부 의미는 있지만, 2026 프로그래밍기능사 실기 대비용 문제은행에서는 코드 실행 흐름을 직접 추적하는 형태가 더 적합하다고 판단했습니다.

## 수정 내용

### Java 6번

기존 문항을 static 변수의 값 변화를 추적하는 실행 결과 문제로 변경했습니다.

```java
class Main {
    static int count = 1;

    public static void main(String[] args) {
        count = count + 2;
        System.out.print(count);
    }
}
```

정답: `3`

수정 이유:

- `static` 키워드를 단순히 외우는 대신 static 변수의 동작을 코드 흐름으로 이해하게 합니다.
- 초기값, 대입문, 출력문을 순서대로 추적하는 실기형 학습에 더 적합합니다.

### Java 7번

기존 클래스명 묻기 문항을 `print`와 `println`의 줄바꿈 차이를 확인하는 실행 결과 문제로 변경했습니다.

```java
class Main {
    public static void main(String[] args) {
        System.out.print("Hello");
        System.out.println("Java");
        System.out.print("2026");
    }
}
```

정답:

```text
HelloJava
2026
```

수정 이유:

- `System`이라는 클래스명을 묻는 것보다 출력 순서와 줄바꿈 여부를 판단하게 하는 것이 실기형 문제에 더 적합합니다.
- 출력 결과 문제에서는 공백과 줄바꿈을 정확히 반영하는 훈련이 필요합니다.

## 함께 수정한 파일

- `src/data/java_150_questions_final_reviewed.json`
- `src/data/study_guides_reviewed.json`

## 학습하기 콘텐츠 반영

두 문항 모두 `학습하기` 팝업 내용도 해당 문제에 맞게 수정했습니다.

- Java 6번: static 변수, 초기값, 대입문, 출력문 추적 중심
- Java 7번: print/println 차이, 출력 순서, 줄바꿈 반영 중심

## 검토 결과

두 문제 모두 기존보다 학생 입장에서 더 자연스럽고, 실기 대비용으로 적합한 실행 결과 예측형 문항으로 개선되었습니다.
