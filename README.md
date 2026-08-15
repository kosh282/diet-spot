# DietSpot

동국대 충무로에서 시작하는 위키형 식단 태그 지도.

## 로컬 실행

1. `.env.local`에 값을 넣습니다.

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_KAKAO_JS_KEY=
```

2. Supabase SQL Editor에서 `supabase/migrations/0001_spots.sql`을 실행합니다.
3. Supabase Authentication에서 Google provider가 켜져 있고, Redirect URL에 `http://localhost:3000/auth/callback`이 있어야 합니다.
4. 카카오 JavaScript SDK 도메인에 `http://localhost:3000`이 등록되어 있어야 합니다.

```
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 시드

전화/방문 확인한 식당만 등록합니다. 운영자 Google 계정으로 로그인한 뒤 앱에서 올리거나, 해당 계정의 `auth.users.id`로 SQL insert합니다.
