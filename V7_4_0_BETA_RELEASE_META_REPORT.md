# v7.4.0 베타 공개 메타 정보 정리 보고서

## 목적
v7.3.4에서 production build가 통과된 것을 기준으로, 베타 공개 전에 필요한 favicon과 사이트 메타 정보를 정리했습니다.

## 반영 내용
1. favicon 404 해결
   - `public/favicon.ico` 추가
   - `public/icon.svg` 추가
   - `public/apple-icon.png` 추가

2. 공유 이미지 추가
   - `public/og-image.svg` 추가

3. Next.js metadata 정리
   - 사이트 제목
   - 설명
   - keywords
   - Open Graph
   - Twitter card
   - icons
   - robots

4. 베타 안내 페이지 FAQ 보강
   - 무료 베타 안내
   - 문제 오류 제보 안내
   - 오답노트/보관함 localStorage 저장 안내
   - AI 문제 변형 준비중 안내

## 환경변수
배포 후 정확한 공유 URL을 쓰려면 Vercel 환경변수에 아래 값을 추가하는 것을 권장합니다.

`NEXT_PUBLIC_SITE_URL=https://실제배포주소`

로컬 테스트에서는 자동으로 `http://localhost:3000`이 사용됩니다.

## Supabase SQL
이번 버전은 추가 SQL 실행이 필요 없습니다.
