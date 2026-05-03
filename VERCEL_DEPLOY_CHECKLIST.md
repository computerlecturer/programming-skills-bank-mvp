# Vercel 배포 체크리스트

본 문서는 프로그래밍기능사 실기 문제은행 MVP를 Vercel에 배포하기 전후 확인해야 할 내용을 정리한 문서입니다.

## 1. 배포 전 로컬 확인

아래 명령어가 모두 정상이어야 합니다.

```powershell
npm.cmd install
npm.cmd run build
npm.cmd run dev
```

확인 주소:

```text
http://localhost:3000
http://localhost:3000/robots.txt
http://localhost:3000/sitemap.xml
```

## 2. GitHub 업로드

1. GitHub에서 새 repository를 생성합니다.
2. 프로젝트 폴더를 GitHub에 업로드합니다.
3. `.env.local`, `.next`, `node_modules`는 업로드하지 않습니다.

업로드 제외 권장:

```text
.env.local
node_modules
.next
```

## 3. Vercel 프로젝트 생성

1. Vercel에 로그인합니다.
2. Add New Project를 클릭합니다.
3. GitHub repository를 선택합니다.
4. Framework Preset은 Next.js로 설정합니다.
5. Build Command는 기본값을 사용합니다.

기본값:

```text
npm run build
```

## 4. Vercel 환경변수 입력

Vercel Project Settings → Environment Variables에서 입력합니다.

필수:

```env
NEXT_PUBLIC_SUPABASE_URL=https://프로젝트ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
NEXT_PUBLIC_SITE_URL=https://배포주소.vercel.app
```

현재 비워도 되는 값:

```env
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
TOSS_CLIENT_KEY=
TOSS_SECRET_KEY=
PORTONE_STORE_ID=
PORTONE_CHANNEL_KEY=
PORTONE_API_SECRET=
```

`NEXT_PUBLIC_SITE_URL`은 배포 주소가 생긴 뒤 입력합니다.

## 5. 첫 배포 후 확인

배포가 끝나면 아래 주소를 확인합니다.

```text
https://배포주소.vercel.app
https://배포주소.vercel.app/subjects
https://배포주소.vercel.app/practice/sql
https://배포주소.vercel.app/login
https://배포주소.vercel.app/signup
https://배포주소.vercel.app/robots.txt
https://배포주소.vercel.app/sitemap.xml
```

## 6. 배포 후 SEO 파일 주소 수정

현재 `public/robots.txt`, `public/sitemap.xml`은 로컬 테스트용으로 `http://localhost:3000` 기준입니다.

배포 주소가 생기면 아래 파일의 주소를 바꿔야 합니다.

```text
public/robots.txt
public/sitemap.xml
```

변경 예시:

```text
http://localhost:3000
↓
https://배포주소.vercel.app
```

개인 도메인을 연결하면 다시 개인 도메인으로 바꿉니다.

```text
https://배포주소.vercel.app
↓
https://개인도메인
```

## 7. Supabase Redirect URL 확인

비밀번호 재설정 기능을 나중에 추가할 경우 아래 주소를 Supabase Redirect URLs에 추가합니다.

로컬:

```text
http://localhost:3000/update-password
```

배포 후:

```text
https://배포주소.vercel.app/update-password
```

현재 버전에는 비밀번호 재설정 기능이 아직 구현되어 있지 않습니다.

## 8. 배포 후 기능 테스트

### 비회원 테스트

```text
홈 접속
과목별 50문항 접근 가능 여부
로그인 없이 제한 범위 확인
```

### 일반 회원 테스트

```text
회원가입
로그인
전체 문제 접근
오류 제보 저장
마이페이지 확인
```

### 관리자 테스트

```text
관리자 로그인
/admin 접근
/admin/reports 접근
오류 제보 상태 변경
관리자 메모 저장
```

## 9. 배포 전 최종 주의사항

현재는 무료 베타입니다.

```text
결제 기능: 비활성화
AI 문제 변형: 일반 회원 비활성화
관리자만 AI 테스트 가능
문제 데이터: JSON
오답노트/보관함: localStorage
오류 제보: Supabase
```
