# v7.4.1 SEO Title/Description 최적화 보고서

## 목적
v7.4.0에서 favicon과 기본 메타 정보를 정리한 뒤, v7.4.1에서는 검색 노출과 공유 미리보기를 고려해 페이지별 title/description 구조를 최적화했습니다.

## 핵심 전략
- 브랜드명은 `프로그래밍기능사 실기연구소` 유지
- 검색형 메인 제목은 `프로그래밍기능사 실기 문제은행 | SQL·Python·Java·Linux` 사용
- 메인 description에는 시험명, 과목명, 문제은행, 오답노트, 오류 제보, 무료 범위를 자연스럽게 포함
- 카카오톡/문자/블로그 공유용 Open Graph 문구는 더 짧고 클릭하기 쉽게 분리

## 반영 내용
1. 전체 사이트 metadata 최적화
   - 검색형 title
   - 광고/SEO형 description
   - Open Graph title/description 분리
   - 검색 키워드 확장

2. 페이지별 metadata 추가
   - `/subjects`
   - `/pricing`
   - `/mock-exam`
   - `/practice/sql`
   - `/practice/python`
   - `/practice/java`
   - `/practice/linux`
   - `/login`
   - `/signup`
   - `/account`
   - `/admin`
   - `/admin/reports`
   - `/my-study`
   - `/wrong-notes`
   - `/analytics`

3. 검색 색인 제어
   - 공개 유입에 적합한 페이지는 index
   - 로그인/마이페이지/관리자/개인 학습 데이터 페이지는 noindex

4. sitemap.xml 생성
   - `src/app/sitemap.ts`
   - 메인, 과목, 베타 안내, 모의고사, 과목별 문제 풀이 페이지 포함

5. robots.txt 생성
   - `src/app/robots.ts`
   - 관리자, 로그인, 회원가입, 개인 학습 페이지는 검색 제외

## 배포 후 설정 권장
Vercel 환경변수에 실제 배포 주소를 넣어야 sitemap과 Open Graph URL이 정확해집니다.

`NEXT_PUBLIC_SITE_URL=https://실제배포주소`

## Supabase SQL
이번 버전은 추가 Supabase SQL 실행이 필요 없습니다.
