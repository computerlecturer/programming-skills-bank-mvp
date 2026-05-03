# v7.4.2 robots.txt / sitemap.xml 404 수정 보고서

## 문제
v7.4.1에서 `src/app/robots.ts`, `src/app/sitemap.ts`를 추가했지만, 로컬 브라우저에서 `/robots.txt`, `/sitemap.xml`이 404로 표시되는 문제가 발생했습니다.

## 수정 내용
Next.js 메타데이터 라우트 대신 확실하게 정적 파일로 제공하도록 변경했습니다.

추가 파일:
- `public/robots.txt`
- `public/sitemap.xml`

삭제 파일:
- `src/app/robots.ts`
- `src/app/sitemap.ts`

## 로컬 확인 주소
- `http://localhost:3000/robots.txt`
- `http://localhost:3000/sitemap.xml`

## 배포 후 수정 필요
현재 파일은 로컬 테스트 기준으로 `http://localhost:3000`이 들어가 있습니다.

Vercel 배포 후 실제 주소가 생기면 다음 값을 실제 배포주소로 바꿔야 합니다.

- `public/robots.txt`의 Sitemap 주소
- `public/sitemap.xml`의 모든 loc 주소

예:
`http://localhost:3000` → `https://실제배포주소.vercel.app`

## Supabase SQL
추가 SQL 실행은 필요 없습니다.
