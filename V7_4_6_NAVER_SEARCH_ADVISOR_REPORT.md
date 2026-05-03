# v7.4.6 네이버 서치어드바이저 인증 메타태그 반영 보고서

## 목적
네이버 서치어드바이저 사이트 소유확인을 위해 네이버 인증 메타태그를 Next.js metadata에 반영했습니다.

## 반영 코드

```html
<meta name="naver-site-verification" content="7390308d11c00b114e5f9d8730b5561533dcff47" />
```

## 수정 파일
- `src/app/layout.tsx`

## 반영 방식
Next.js App Router의 `metadata.verification.other` 필드에 네이버 인증 코드를 추가했습니다.

## 적용 방법
1. 이 버전을 GitHub 저장소 폴더에 덮어쓰기
2. GitHub Desktop에서 commit
3. Push origin
4. Vercel 자동 재배포 완료 대기
5. 네이버 서치어드바이저 화면으로 돌아가서 소유확인 클릭

## 확인 주소
배포 후 홈 페이지 HTML에 네이버 인증 메타태그가 포함되어야 합니다.

```text
https://programming-skills-bank-mvp.vercel.app/
```

## 네이버 소유확인 후 할 일
네이버 서치어드바이저에서 사이트맵을 제출합니다.

```text
https://programming-skills-bank-mvp.vercel.app/sitemap.xml
```

## Supabase SQL
추가 Supabase SQL 실행은 필요 없습니다.
