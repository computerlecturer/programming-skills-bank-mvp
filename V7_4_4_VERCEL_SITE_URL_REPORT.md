# v7.4.4 Vercel 배포 주소 반영 보고서

## 목적
실제 Vercel 배포 주소가 생성되었으므로 SEO 관련 URL을 로컬 주소에서 배포 주소로 변경했습니다.

## 반영한 배포 주소

```text
https://programming-skills-bank-mvp.vercel.app
```

## 수정 내용
1. `src/app/layout.tsx`
   - `metadataBase` fallback 주소를 `https://programming-skills-bank-mvp.vercel.app`로 변경

2. `public/robots.txt`
   - Sitemap 주소를 `https://programming-skills-bank-mvp.vercel.app/sitemap.xml`로 변경

3. `public/sitemap.xml`
   - 모든 `<loc>` 주소를 `https://programming-skills-bank-mvp.vercel.app` 기준으로 변경

## Vercel 환경변수 권장 설정
Vercel Project Settings → Environment Variables에 아래 값을 추가하는 것을 권장합니다.

```env
NEXT_PUBLIC_SITE_URL=https://programming-skills-bank-mvp.vercel.app
```

환경은 `Production and Preview`로 설정하면 됩니다.

## 적용 방법
이 버전 파일을 GitHub 저장소에 반영한 뒤 commit/push하면 Vercel이 자동 재배포합니다.

## 배포 후 확인 주소
```text
https://programming-skills-bank-mvp.vercel.app
https://programming-skills-bank-mvp.vercel.app/robots.txt
https://programming-skills-bank-mvp.vercel.app/sitemap.xml
```

## Supabase SQL
추가 Supabase SQL 실행은 필요 없습니다.
