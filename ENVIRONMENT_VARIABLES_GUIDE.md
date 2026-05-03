# 환경변수 설정 가이드

본 문서는 로컬 개발과 Vercel 배포에서 필요한 환경변수를 정리한 문서입니다.

## 1. 로컬 개발용 `.env.local`

프로젝트 최상위 폴더에 `.env.local` 파일을 만듭니다.

예시:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://프로젝트ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Payment Provider
TOSS_CLIENT_KEY=
TOSS_SECRET_KEY=
PORTONE_STORE_ID=
PORTONE_CHANNEL_KEY=
PORTONE_API_SECRET=

# OpenAI AI 문제 변형 기능
OPENAI_API_KEY=
```

## 2. 현재 꼭 필요한 값

현재 MVP에서 실제로 필요한 값은 아래 두 개입니다.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

이 두 값이 있어야 Supabase 회원가입, 로그인, 오류 제보, 관리자 대시보드가 동작합니다.

## 3. 로컬에서는 선택값

로컬에서는 아래 값을 넣어도 되고, 비워두어도 됩니다.

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

값이 없으면 앱 내부에서 기본값으로 `http://localhost:3000`을 사용합니다.

## 4. Vercel 배포 후 필요한 값

Vercel 배포 후에는 아래 값을 입력하는 것이 좋습니다.

```env
NEXT_PUBLIC_SITE_URL=https://배포주소.vercel.app
```

이 값은 다음에 사용됩니다.

```text
sitemap 주소
robots.txt sitemap 주소
Open Graph 대표 URL
검색엔진 대표 URL
```

단, 현재 `public/robots.txt`, `public/sitemap.xml`은 정적 파일이므로 배포주소가 확정되면 파일 내부 주소도 직접 바꿔야 합니다.

## 5. 아직 비워두는 값

현재 베타에서는 아래 값들은 비워두어도 됩니다.

```env
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
TOSS_CLIENT_KEY=
TOSS_SECRET_KEY=
PORTONE_STORE_ID=
PORTONE_CHANNEL_KEY=
PORTONE_API_SECRET=
```

이유:

```text
결제 기능은 비활성화
AI 실제 API 호출은 아직 활성화하지 않음
관리자 테스트 UI만 제공
```

## 6. 절대 공개하면 안 되는 값

아래 값은 나중에 입력하더라도 GitHub에 올리면 안 됩니다.

```env
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
TOSS_SECRET_KEY
PORTONE_API_SECRET
```

반드시 Vercel Environment Variables에만 입력합니다.

## 7. GitHub 업로드 제외

`.env.local`은 GitHub에 업로드하지 않습니다.

`.gitignore`에 아래 항목이 있는지 확인합니다.

```text
.env.local
.env
node_modules
.next
```
