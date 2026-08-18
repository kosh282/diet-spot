# DietSpot

채식·할랄 태그를 지도에서 걸러 보는 공유 맛집 지도.  
A shared restaurant map for filtering vegetarian and halal tags.

- [한국어](#한국어)
- [English](#english)

---

## 한국어

DietSpot은 사용자가 식당에 식단 태그와 짧은 메모를 붙이고, 지도 핀으로 바로 걸러 보는 **위키형 맛집 지도**입니다. 카카오맵처럼 모든 식당을 보여 주는 앱이 아니라, **채식·비건·할랄처럼 “먹을 수 있는지”** 가 먼저인 화면입니다.

1차는 **동국대·충무로** 근처부터 채웁니다. 저장 구조는 특정 도시에 묶여 있지 않아서 나중에 다른 동네로 넓힐 수 있습니다.

공식 할랄·채식 인증 서비스가 아닙니다. 태그는 제보와 위키 수정에 기대며, 방문 전에 매장에 다시 확인해야 합니다.

### 누구를 위한가

- 점심 시간에 채식 옵션이 있는 집을 빨리 고르고 싶은 사람
- 할랄·채식 가능 여부를 한국어 블로그 없이 확인하고 싶은 외국인 방문자

조회는 가입 없이 됩니다. 올리거나 고칠 때만 Google 로그인이 필요합니다.

공개 주소: [https://diet-spot-ko.vercel.app](https://diet-spot-ko.vercel.app)

### 할 수 있는 일

- 첫 방문 때 화면 정중앙에 서비스 안내가 뜬다. **시작하기** 또는 **다시 보지 않기**를 누르면 다시 안 뜬다
- 지도에서 식단 칩(채식, 할랄 등)으로 핀을 걸러 보기. 켜 둔 필터는 **필터 지우기**로 한 번에 끈다
- 상단 검색으로 이미 올라간 상호·주소·태그를 찾아 핀으로 이동
- 왼쪽 아래 **가까운 곳** 목록(기본은 접힘). 내 위치가 있으면 그 기준, 없으면 충무로 기준
- 핀을 눌러 주소, 한·영 메모, 원등록자·마지막 수정, 최근 방문·전화 확인을 보기
- 전화번호를 눌러 걸기, 주소 복사, 카카오맵·길찾기, 현재 필터가 붙은 지도 링크 공유
- 오른쪽 아래 **내 위치**로 지도를 현재 위치로 옮기기
- ＋ 등록으로 카카오에서 식당을 검색해 올리기 (같은 장소는 `place_id`로 중복 불가, 식단 태그 필수)
- 로그인한 사람이 메모·태그를 고치기. 수정 중에는 **취소**로 빠져나올 수 있다. 삭제는 처음 올린 사람만
- 할랄 태그는 처음 올린 사람만 붙이거나 뗄 수 있음
- 한국어 / English 전환(모바일 버튼은 바꿀 언어를 보여 줌), 로마자로 상호 검색
- 미확인 정보와 외부 목록 제보를 배지로 구분해서 보여 주기

식단 필터는 고른 태그를 **모두** 만족하는 곳만 남습니다(채식 칩은 비건 매장도 포함). 음식 종류·매장 유형은 같은 축 안에서 **하나라도** 맞으면 됩니다.

### 스택

Next.js (App Router, TypeScript) · Tailwind CSS · Supabase (Postgres, Auth, RLS) · Google OAuth · 카카오맵

### 로컬 실행

1. `.env.example`을 `.env.local`로 복사하고 값을 넣습니다.

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_KAKAO_JS_KEY=
NEXT_PUBLIC_SITE_URL=
```

2. Supabase SQL Editor에서 `supabase/migrations/` 파일을 번호 순서대로 실행합니다.
3. Supabase Authentication에서 Google 로그인을 켜고, Redirect URL에 `http://localhost:3000/auth/callback`을 넣습니다.
4. 카카오 개발자 콘솔 JavaScript 키 도메인에 `http://localhost:3000`을 등록합니다.

```
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

---

## English

DietSpot is a **wiki-style restaurant map**. People add diet tags and a short note to a place, then filter pins on a map. It is not a general map of every restaurant. The first question is whether you can eat there — vegetarian, vegan, halal, and similar tags.

The first neighborhood is **Dongguk University / Chungmuro** in Seoul. The data model is not locked to one city, so the map can grow later.

This is **not** an official halal or vegetarian certification. Tags come from listings and wiki edits. Confirm with the restaurant before you go.

### Who it is for

- Someone who needs a vegetarian option in a 15-minute lunch window
- A visitor who wants halal or vegetarian pins without reading Korean blogs

Anyone can browse. Google sign-in is required only to add or edit.

Live: [https://diet-spot-ko.vercel.app](https://diet-spot-ko.vercel.app)

### What you can do

- On a first visit, a centered intro explains the concept and how to use it. **Get started** or **Don’t show again** keeps it from returning
- Filter pins with diet chips (vegetarian, halal, and others). **Clear filters** turns them all off at once
- Search listed names, addresses, and tags from the header and jump to the pin
- Open **Nearby** at the bottom left (collapsed by default). Distances use your location when available, otherwise Chungmuro
- Open a pin for address, Korean and English notes, who added it, who last edited it, and the last phone/visit check
- Tap the phone number to call, copy the address, open Kakao Map or directions, or share a link that keeps the current filters
- Use **My location** to pan the map to where you are
- Use + Add to search Kakao and list a restaurant (duplicate `place_id` is blocked; at least one diet tag is required)
- Edit notes and tags after login. **Cancel** leaves edit mode without saving. Only the original author can delete
- Only the original author can add or remove the Halal tag
- Switch Korean / English (the mobile control shows the language you will switch to); listed names also match Hangul or romanization
- See **Unverified** vs **from a public list** so a tag is not mistaken for a certification

Diet filters are **AND** (every selected diet tag must match; Vegetarian also matches vegan places). Cuisine and venue filters are **OR** within that axis.

### Stack

Next.js (App Router, TypeScript) · Tailwind CSS · Supabase (Postgres, Auth, RLS) · Google OAuth · Kakao Map

### Run locally

1. Copy `.env.example` to `.env.local` and fill in the values.

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_KAKAO_JS_KEY=
NEXT_PUBLIC_SITE_URL=
```

2. In the Supabase SQL Editor, run the files in `supabase/migrations/` in order.
3. Enable Google in Supabase Authentication and add `http://localhost:3000/auth/callback` to the redirect allow list.
4. Register `http://localhost:3000` on the Kakao JavaScript SDK key.

```
npm install
npm run dev
```

Open `http://localhost:3000`.
