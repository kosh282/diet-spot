---
name: DietSpot 웹앱
overview: DietSpot MVP — Next.js(App Router) + Supabase + 카카오맵. 조회는 비로그인, 등록·수정은 Google 소셜 로그인. 식단태그 필수·중복불가·수정은 로그인 유저 개방·삭제는 작성자만.
todos:
  - id: project-init
    content: Next.js(App Router·TS) + Tailwind + Supabase 클라이언트 셋업
    status: completed
  - id: db-rls
    content: spots 테이블·unique(place_id)·diet 필수 제약·RLS 정책
    status: completed
  - id: auth-google
    content: Google OAuth(Supabase) · /auth/callback · 로그인 게이트(등록·수정)
    status: completed
  - id: map-init
    content: 카카오맵 클라이언트 로드·동국대 중심·면책 고지 UI
    status: completed
  - id: kakao-search
    content: 장소 검색(JS SDK 또는 Next API 프록시)·placeId 중복 차단
    status: completed
  - id: spot-crud
    content: 등록·수정(태그·메모)·삭제(작성자만)·마지막 수정 표시
    status: completed
  - id: tag-presets
    content: diet/cuisine/venue 프리셋·한영병기·필터 축내 OR·축간 AND
    status: completed
  - id: markers-filter
    content: 핀 렌더·태그 필터(미선택=전체)·상세 패널(원등록자+마지막수정)
    status: completed
  - id: seed-data
    content: 확인된 동국대 근처 ~20곳 SQL/스크립트 시드
    status: completed
  - id: deploy
    content: Vercel 배포·카카오/Google/Supabase Redirect URL·환경변수
    status: completed
isProject: false
---

# DietSpot MVP 기획 명세서

> 표시 방식: 지도 위에 음식점 핀 → 태그로 걸러보기 → 핀 클릭 시 팝업으로 정보 확인  
> 목표 스택: **Next.js (App Router, TypeScript)** · **Supabase (Auth + Postgres + RLS)** · **Google OAuth** · **카카오맵**  
> 참고 프로토타입: [`0804/dietspot.html`](c:\Users\user\Desktop\bootcamp\0804\dietspot.html) (카카오맵 · Firebase) — 동작 참고용, 재구현 대상  
> 제출용 마크다운: [`0804/DietSpot_MVP_기획_명세서.md`](c:\Users\user\Desktop\bootcamp\0804\DietSpot_MVP_기획_명세서.md)

---

## 1. 서비스 정의

| 항목 | 내용 |
|------|------|
| 이름 | DietSpot |
| 한문장 | 사용자가 채식·할랄 같은 태그와 함께 식당을 올리고, 지도 핀·팝업으로 빠르게 걸러 보는 공유 맛집 지도 |

사람들이 직접 정보를 쌓는 위키형 지도다. **1차는 동국대(충무로) 근처**로 시작하고, 데이터 구조는 나중에 전국으로 넓혀도 되도록 특정 도시에 가두지 않는다.

---

## 2. 페르소나

| 요소 | 윤서아 (주 사용자) | Aisha (보조 사용자) |
|------|-------------------|---------------------|
| 기본 | 21세, 동국대 경영 3학년 | 24세, 인도네시아, 해운대 단기 연수, 무슬림 |
| 하루 상황 | 점심 15분에 뭐 먹을지 급히 정함 | 호스트와 함께 먹을 수 있는 집을 찾음 |
| 목표 | 채식 옵션 있는 곳을 빨리 고름 | 할랄/채식인지 확신이 가는 곳을 고름 |
| 불편함 | 지도·후기 뒤지다 시간 끝남 | 블로그·전화 확인에 너무 오래 걸림 |
| 지금 대안 | 단골·편의점·단톡 | 구글/네이버 검색 + 한국인 전화 |
| 한 줄 요약 | 배고프고 귀찮아서, 가입·긴 입력 없으면 바로 닫는 학생 | 틀린 정보가 더 무섭고, 영어 태그·확실한 핀이 있어야 쓰는 외국인 |

---

## 3. 가상 인터뷰 요약 (안 쓸 이유 → 대응)

| 안 쓸 이유 | 대응 |
|------------|------|
| 핀이 없거나 우리 동네가 비어 있음 | 배포 전에 확인한 식당 ~20곳을 미리 넣어 둔다 |
| 카카오맵이랑 뭐가 다른지 모르겠음 | 첫 화면에서 채식/할랄 필터만으로 핀이 줄어드는 차이를 바로 보여 준다 |
| 가입·비번이 길다 | 볼 때는 가입 없이, 올릴 때만 **Google 한 번** |
| 정보가 틀리면 배신감 / 할랄은 실수 비용이 큼 | “공식 인증 아님, 매장에 다시 확인” 문구 고정 + **로그인한 사람만** 수정·삭제는 작성자만 |
| 영어가 없으면 외국인은 못 읽음 | 식단 태그에 Halal / Vegetarian 병기 |

서아는 “한 번에 맞으면” 쓰고, 아이샤는 “전화 없이 식사 성공하면” 추천한다. 둘 다 빈 지도·애매한 태그에서는 바로 떠난다.

---

## 4. 기능정의 (MoSCoW)

| 기능 | 한 줄 설명 | 우선순위 |
|------|------------|----------|
| **Google로 올리기·고치기** | 조회는 비로그인. 등록·수정은 Google 로그인 후에만 | **Must** |
| **지도에서 찾아 등록** | 식당을 검색해 고르고 태그와 메모를 붙여 올린다 | **Must** |
| **태그 붙이기** | 음식 종류 / 채식·할랄 / 식당·카페 종류를 고른다 | **Must** |
| **태그로 핀 걸러보기** | 고른 태그에 맞는 핀만 지도에 남긴다 | **Must** |
| **핀 눌러 정보 보기** | 이름·주소·태그·메모·올린 사람을 상세 패널로 본다 | **Must** |
| **식당 정보 수정(위키형)** | 로그인한 사람이면 작성자가 아니어도 태그·메모를 고친다 | **Must** |
| **내 글 삭제** | 삭제는 내가(같은 Google 계정으로) 올린 글만 가능하다 | **Must** |
| **미리 넣어 둔 식당** | 처음부터 지도가 비지 않게 확인된 곳을 채운다 | **Must** |
| **주의 문구** | 공식 할랄/채식 인증이 아님을 화면에 밝힌다 | **Must** |
| **한 동네부터 (개방형)** | 출시는 동국대 근처·시드 집중, 저장/등록은 전국 확장이 가능하게 연다 | **Must** |
| **마지막 수정 표시** | 원등록자 + 마지막 수정 이름·날짜를 패널에 보여 준다 | **Must** |
| **이름·태그 검색** | 상단 검색바로 **이미 등록된** 상호·주소·태그를 찾고 핀으로 이동 | **Must** |
| **한/영 UI** | 화면 전체 KO/EN 전환. 식단 태그는 Halal / Vegetarian 병기 | **Must** |
| **지도/필터 링크 공유** | 현재 필터·언어·선택한 장소가 붙은 링크를 보낸다 | **Must** |
| **첫 방문 안내** | 정중앙 모달로 컨셉·사용법 안내. 시작하기/다시 보지 않기로 재표시 안 함 | **Must** |
| **가까운 곳** | 좌하단 목록(기본 접힘). 내 위치 또는 충무로 기준 거리 | Should |
| **카카오 길찾기** | 상세에서 카카오맵 길찾기 링크를 연다 (앱 내 내비는 없음) | Should |
| **오늘 확인함** | 전화·방문 확인 스탬프. 공식 인증이 아님 | Should |
| **내 위치** | GPS/IP로 지도를 옮긴다 | Should |
| **필터 지우기** | 켜 둔 칩을 한 번에 끈다 | Should |
| 잘못된 정보 신고 | “이 태그 틀린 것 같아요”를 남긴다 | Could |
| 마커 클러스터·다색 핀 | 레퍼런스식 숫자 클러스터 / 식단별 색 | Could |

---

## 5. 사용자 흐름 (화면 4개)

| 화면 | 무엇을 하나 | 다음으로 가는 조건 |
|------|-------------|-------------------|
| 0. 첫 방문 안내 | 정중앙 모달: 컨셉 + 칩·핀·검색·등록 사용법 | 시작하기/다시 보지 않기 → 재표시 안 함. 바깥·× → 이번만 닫음 |
| A. 지도+필터 | 동네 지도, 태그 칩, 핀들, 가까운 곳, 로그인/공유/언어 | 태그 누르면 핀이 줄고 / 핀 누르면 B로 / 검색은 등록된 곳 / “등록” 누르면 (미로그인 시 D 후) C로 |
| B. 상세 패널 | 이름·주소·전화·태그·메모·올린 사람·마지막 수정·최근 확인. 카카오맵·길찾기·공유 | 닫으면 A로 / 수정·삭제·확인 시 미로그인이면 D / 저장·삭제 후 A |
| C. 등록 | 식당 검색 → 선택 → **식단 태그 필수**·메모 → 저장 | 이미 등록된 장소면 막음 · 성공 시 A로 새 핀 |
| D. Google 로그인 | “Google로 계속하기” | 성공 후 원래 하려던 C 또는 B 수정으로 복귀 |

조회는 A→B가 기본이고, 등록은 A→(D)→C→A다. 배고플 때는 A→B만으로 끝나게 한다.

---

## 6. 이번엔 안 할 것 (Won't)

| 안 할 것 | 이유 |
|----------|------|
| 운영자 전용 관리 화면 | 3주는 직접 데이터 손으로 정리하는 편이 빠름 |
| 전국을 **동시에** 키우기 | 1차는 동국대 시드에 집중. 구조는 열어 두되 운영·홍보는 한 동네부터 |
| 공식 할랄/채식 인증 배지 | 검증 체계가 없고 잘못되면 위험함 |
| 이메일·비밀번호 직접 가입 | Google 소셜만. 가입 폼을 만들지 않음 |
| 카카오 로그인 · Anonymous Auth | Google만. 익명 UUID/닉네임만 올리기는 하지 않음 |
| 실시간 대기·리뷰 긁어오기 | 핵심(태그 지도)과 무관하고 범위가 커짐 |
| 앱 내 내비게이션 | 카카오맵 **길찾기 링크**만 연다. 경로 안내는 카카오에 맡김 |
| 완벽한 CMS·신고 큐 | 틀린 태그 신고 버튼은 Could. 1차는 확인 스탬프·면책으로 대체 |

---

**이 명세서로 3주 안에 완주 가능한가?**  
가능 — 단, Must만 하고 권역 1곳·시드 데이터·핀/필터/등록/팝업에 범위를 고정할 때만.

---

## 7. 빌드 전 확정 정책

### 7.1 데이터·권한 (확정)

| 정책 | 규칙 |
|------|------|
| 식단 태그 | **필수** — 등록·수정 시 `diet` 태그 최소 1개 |
| 중복 등록 | **불가** — 같은 카카오 장소 ID(`placeId`)가 이미 있으면 새로 못 올림 |
| 수정 권한 | **로그인 유저 개방** — 작성자 아니어도 **로그인한 사람**은 태그·메모 수정 가능. **상호·placeId·원등록자·source는 불변**. 주소·좌표는 **위치 고치기**로만 수정. 할랄 태그는 **원등록자만** 붙이거나 뗌. 비로그인은 보기만 |
| 삭제 권한 | **작성자만** — 같은 **Google 계정**(`auth.uid()`) 기준. 다른 기기에서도 같은 계정으로 로그인하면 삭제 가능 |
| 수정 기록 | 패널에 **마지막 수정한 표시 이름·시각** + 원등록자 유지 표시 (**Must**) |
| 표시 이름 | Google 프로필. 폴백: `full_name` → `name` → `사용자`. 이메일은 **공개·저장하지 않음**. 별도 닉네임 입력란 없음 |
| 필터 기본 | **칩 선택 없음 = 전체 핀 표시**. 축별로 고른 뒤에만 AND/OR 적용. 켜 둔 필터는 **필터 지우기**로 한 번에 해제 |
| 주소 저장 | 카카오 **도로명(`road_address_name`) 우선**, 없으면 지번(`address_name`) |
| 상단 검색바 (Must) | **이미 등록된** 상호·주소·태그 검색 → 핀 이동. 카카오 장소 검색·등록은 **＋ 등록** (화면 C) |

### 7.2 권역·확장 (확정)

| 정책 | 규칙 |
|------|------|
| 1차 출시 | **동국대(충무로) 인근** — 지도 초기 중심·시드·안내 |
| 전국 확장 | 좌표·주소만 저장, 지역 코드로 가두지 않음. 다른 지역 등록 차단 안 함 |
| 시드 | 동국대 근처 ~20곳 |
| 초기 중심 | 동국대 서울캠퍼스 근처 `37.5583, 126.9990` (충무로·동국대역). 구현 시 카카오맵으로 한 번 더 맞춰 확정 |

### 7.3 태그 프리셋 (확정)

커스텀 태그 입력은 1차에서 막고, 아래 칩만 고른다.  
식단(`diet`)은 **등록·수정 시 최소 1개 필수**. 음식·유형은 선택.

#### 식단 `diet` (필수 축 · 한/영 병기)

| 표시 | 저장값 | 영문 |
|------|--------|------|
| 채식 | vegetarian | Vegetarian |
| 비건 | vegan | Vegan |
| 페스코 | pescatarian | Pescatarian |
| 할랄 | halal | Halal |
| 글루텐프리 | gluten_free | Gluten-free |
| 해산물 제외 | no_seafood | No seafood |
| 돼지고기 제외 | no_pork | No pork |
| 유제품 제외 | dairy_free | Dairy-free |

#### 음식 종류 `cuisine` (선택)

| 표시 | 저장값 |
|------|--------|
| 한식 | korean |
| 중식 | chinese |
| 일식 | japanese |
| 양식 | western |
| 분식 | snack |
| 아시안 | asian |
| 인도/남아시아 | south_asian |
| 중동 | middle_eastern |
| 디저트 | dessert |
| 기타 | other |

#### 식당 유형 `venue` (선택)

| 표시 | 저장값 |
|------|--------|
| 식당 | restaurant |
| 카페 | cafe |
| 베이커리 | bakery |
| 푸드코트 | food_court |
| 포장전문 | takeout |
| 편의점 | convenience |

**필터 규칙:** 식단(`diet`)은 고른 태그를 **모두** 만족(AND). **채식 칩은 비건 매장도 포함**. 음식·유형은 같은 축 안에서 **하나라도** 맞으면 됨(OR).  
예) 식단=할랄 + 음식=한식 → 둘 다 있는 핀만.

### 7.4 UI·기타 (확정)

| 정책 | 규칙 |
|------|------|
| 필터 | 식단 AND(채식⊃비건) · 음식/유형 OR. **필터 지우기**로 한 번에 해제 |
| 조회 | 가입 없이 지도·필터·상세 패널 |
| 등록·수정 | **Google 로그인 필수**. 미로그인이면 “Google로 계속하기” |
| 삭제 | 로그인 + 원등록자와 같은 계정 |
| 레이아웃 | **지도가 전체 배경**. UI는 지도 위 플로팅 카드/바만 (레퍼런스와 동일 구성) |
| 핀 색 | 1차 **딥 그린** 원형 단일 핀 (`#1B7A4E` 계열, 구현 시 CSS 변수). 사진·다색 핀 제외 |
| 입력 제한 | 메모 0~300자 (한·영 각각, 빈 메모 허용, DB CHECK). 닉네임 입력란 없음 |
| 태그 칩 표시 | 식단은 `채식 · Vegetarian`처럼 한/영 병기. 음식·유형은 한글만 |
| 상단 검색바 | **등록된 상호 검색·핀 이동**. 카카오 등록은 ＋ 등록 |
| UI 언어 | 화면 전체 **한국어 / English**. 모바일 토글은 바꿀 언어(EN/KO)를 표시 |
| 첫 방문 | 정중앙 안내 모달. 시작하기·다시 보지 않기 → `localStorage`에 저장해 재표시 안 함 |
| 면책 | 안내 모달·상세 패널에 상시. 데스크톱만 지도 하단 바. 모바일 지도는 가리지 않음 |

### 7.4.1 UI 레퍼런스 (확정)

첨부 맵 앱 스크린샷을 **시각·레이아웃 기준**으로 쓴다. Google Maps / 수천 개 클러스터 / 사진 핀은 베끼지 않고, **플로팅 UI + 풀스크린 지도**만 가져온다.

**가져올 것**

| 요소 | DietSpot 적용 |
|------|----------------|
| 풀스크린 지도 캔버스 | 카카오맵이 뷰포트 100% |
| 상단 플로팅 검색바 | 흰 라운드 바 + 그림자. placeholder `장소 검색...`. **등록된 곳 검색**. 카카오 등록은 ＋ 등록 |
| 우측 플로팅 상세 패널 | 핀 클릭 시. 흰 카드·라운드·스크롤. 데스크톱 |
| 하단 건수 뱃지 | `N곳` 또는 `필터 N / 전체 M곳` |
| 우상단 작은 아이콘 버튼 | 로그인/아바타, (선택) 새로고침 |
| 선택 핀 강조 | 클릭한 핀만 링/스케일로 구분 |

**1차에 안 가져올 것 (레퍼런스에 있어도)**

| 제외 | 이유 |
|------|------|
| 사진 원형 마커·클러스터 `110+` | 시드 ~20곳·이미지 업로드 Won't. 클러스터는 전국 확대 후 Could |
| 다색·아이콘 핀 | 명세 단일 색. 식단별 색은 Could |
| 영업시간 블록 | 데이터 모델에 없음 · Won't |
| 지도 레이어(위성 등) 토글 | 카카오 기본 지도만 |
| 소개란 외부 앱 링크 나열 | 메모 + 면책만 |

**반응형**

| 뷰 | 상세 | 등록 |
|----|------|------|
| 데스크톱 (≥768) | 우측 플로팅 패널 (레퍼런스) | 우측 또는 중앙 모달 카드 |
| 모바일 | 하단 바텀시트 (같은 내용) | 바텀시트 전체 |

**비주얼 토큰 (초안)**

- 카드: 흰 배경, `rounded-2xl`, 가벼운 `shadow-lg`, 지도 위 `z-10+`
- 검색바·패널·건수 뱃지: 같은 카드 언어
- 액센트: 핀·FAB·선택 칩에 **딥 그린** (`--pin: #1B7A4E`). 보라 그라데이션·크림+세리프 AI 기본룩 피함
- 면책: 안내 모달·상세 패널. 데스크톱만 지도 하단 반투명 바. 모바일 지도는 가리지 않음
- 브랜드: 우상단 또는 검색바 좌측에 작은 **DietSpot** 워드마크 (히어로 랜딩은 없음)

### 7.5 시드 데이터 수집 방법 (확정)

**원칙:** 인터넷으로 **후보 목록**을 만들고, 카카오맵으로 위치·상호를 맞춘 뒤, **전화/방문 확인한 곳만** 시드에 넣는다.  
블로그만 보고 태그 다는 것은 금지(명세의 신뢰·면책 정책과 충돌).

| 단계 | 누가 | 무엇을 |
|------|------|--------|
| 1. 후보 수집 | AI/웹 조사 + 본인 | HappyCow, 할랄 가이드, 다이닝코드, 네이버/카카오 검색으로 동국대·충무로 후보 20~40곳 |
| 2. 위치 확정 | 본인 | 카카오맵에서 상호·주소·placeId 확인 (폐업/이전 걸러냄) |
| 3. 태그 확인 | 본인 | 전화 또는 방문으로 채식/할랄/메뉴 가능 여부 확인 |
| 4. 시드 등록 | 본인 | 확인된 ~20곳을 DietSpot에 등록, 메모에 `전화 확인`/`방문 확인` + 날짜 |

**AI가 할 수 있는 것:** 후보 리스트·출처 링크·추정 태그 초안  
**AI가 하면 안 되는 것:** 확인 없이 할랄/채식 확정 태그로 시드 확정

#### 웹 조사로 나온 동국대·충무로 후보 예시 (미확인 · 1단계용)

| 후보 | 추정 태그 | 출처 메모 | 다음 액션 |
|------|-----------|-----------|-----------|
| 죠티(Jyoti) 인도레스토랑 충무로 | 채식·비건옵션·할랄 가능 추정, 인도/남아시아, 식당 | HappyCow·islaminkorea·후기 | 카카오 검색 → 전화로 할랄/비건 확인 |
| 적수방(대만 사찰음식, 동국대역 인근) | 채식·비건옵션, 중식/아시안, 식당 | HappyCow | 영업·채식 범위 전화/방문 |
| 샐러디 충무로역점 | 비건 옵션(메뉴에 따라), 카페/포장 | 다이닝코드 후기 | 상시 비건 메뉴 있는지 확인 |
| 명동·종로 인근 할랄(캄퐁쿠, 인디아쉐프 등) | 할랄 | 할랄 가이드 블로그 | 동국대에서 거리 보고 시드 범위에 넣을지 결정 |

상록원 채식당 등 **교내 과거 메뉴**는 현재 미운영 언급이 있어 시드 후보에서 제외하거나 재확인 후만 포함.

---

## 8. 기술 스택 (확정 제안)

기존 프로토타입(HTML + Firebase)은 버리고, 아래 스택으로 재구현한다.

| 레이어 | 선택 | 이유 |
|--------|------|------|
| 프론트 | **Next.js 15 App Router + TypeScript** | 부트캠프 제출·이후 확장(공유 링크, API 프록시)에 맞춤 |
| 스타일 | **Tailwind CSS** | 모바일 풀스크린 지도 + 칩 UI를 빠르게 |
| 지도 | **카카오맵 JavaScript API** | 국내 장소 검색·placeId가 핵심. `next/script` + `dynamic(..., { ssr: false })` |
| 백엔드 | **Supabase** (Postgres + Auth + RLS) | 서버 직접 운영 없이 CRUD·권한 |
| 인증 | **Google OAuth** (Supabase Auth) | 등록·수정 주체를 계정에 고정. 조회는 비로그인 |
| 배포 | **Vercel** | Next.js 기본. 카카오·Google·Supabase Redirect URL에 배포 도메인 등록 |

**프론트가 직접 할 일 / 서버가 할 일**

- 지도·필터·팝업·등록 폼: 전부 **Client Component**
- 카카오 REST 키워드 검색을 쓸 경우: CORS 때문에 **Next.js Route Handler**로 프록시 (`/api/places?q=`)
- 카카오맵 JS SDK `places` 서비스를 쓰면 클라이언트만으로도 검색 가능 → **1차는 JS SDK 검색을 기본**, REST 프록시는 막히면 대안
- spots CRUD: 브라우저에서 **Supabase JS 클라이언트** 직접 호출 (RLS가 권한)
- Google 로그인: `signInWithOAuth({ provider: 'google' })` → `/auth/callback`에서 세션 교환 (`@supabase/ssr` + middleware)

---

## 9. 화면·상태 상세

라우트는 **`/`** (지도) + **`/auth/callback`** (OAuth 코드 교환).  
구성: **지도 풀블리드 + 플로팅 UI** (레퍼런스). 등록·상세·로그인은 오버레이. 공유 링크는 `?diet=` `?spot=` `?lang=` 쿼리.

```
┌─────────────────────────────────────────────────────────┐
│  [🔍 장소 검색...]     [공유] [KO/EN] [로그인/아바타]     │  ← 플로팅
│  [채식][비건][할랄] … [더보기] [필터 지우기]              │
│                                                         │
│                     카카오맵 (100%)                       │
│                        · 핀들                            │
│                                                         │
│  [가까운 곳 ▾]                          [내 위치]         │
│  [12곳]                                   [＋ 등록]       │
│  (데스크톱만 면책 1줄)                                    │
│                              ┌──────────────────────┐   │
│                              │ 상호 · 태그 · 메모    │   │  ← 데스크톱
│                              │ 카카오맵·길찾기·공유  │   │     우측 패널
│                              │ [수정] [삭제]    [×] │   │
│                              └──────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

모바일: 우측 패널 대신 **하단 바텀시트**. 필터 칩은 검색바 아래 한 줄. 첫 방문 시 **정중앙 안내 모달**.

### 9.1 화면 A — 지도 + 플로팅 셸

- 풀스크린 카카오맵, 초기 중심 동국대, 줌 ~레벨 4~5. 내 위치가 한반도 안이면 그쪽으로 이동
- **상단 검색바**: 흰 라운드 플로팅. **이미 등록된** 상호·주소·태그 검색 → 핀 이동. 빈 Enter로 가까운 첫 항목을 고르지 않음. 입력값은 ×로 지움
- **필터 칩**: 검색바 바로 아래. **선택 없음 = 전체 표시**. 식단 항상 노출, 음식·유형·영업종료는 “더보기”. 켜져 있으면 **필터 지우기**
- **우상단**: 공유(오른쪽 꺾인 화살표) · 언어 · 로그인 / 아바타+로그아웃
- **좌하단**: **가까운 곳**(기본 접힘, 탭하면 펼침) · `N곳` 건수 뱃지. 데스크톱만 면책 1줄
- **우하단**: 내 위치 버튼 · FAB “등록”(미로그인이면 D)
- 필터 0개: 토스트 + **필터 지우기**. 칩·헤더를 가리지 않게 필터 아래쪽에 둠
- Esc: 검색·상세·로그인·위치 고치기 닫기. 로그인 시트는 바깥 탭으로도 닫힘
- 로딩/에러: 지도 위 반투명 + 짧은 문구·재시도

### 9.2 화면 B — 상세 패널 (레퍼런스 우측 카드)

데스크톱: 지도 위 **우측 플로팅 카드**. 모바일: **바텀시트**.

| 블록 | 내용 |
|------|------|
| 헤더 | 상호(크게) · 식단/유형 한 줄 요약 · 닫기(×) |
| 신뢰 | 미확인 / 외부 목록 제보 · 할랄 공식 인증 아님 · 최근 확인 |
| 주소 | 카카오 주소 · **주소 복사** · 전화번호는 `tel:` 로 걸기 |
| 바로가기 | 카카오맵 · 길찾기 · 공유 |
| 태그 | diet / cuisine / venue 칩 |
| 메모 | 로케일에 맞는 한·영 메모 (없으면 블록 숨김) |
| 메타 | `원등록: {이름}` · `마지막 수정: {이름} · {날짜}` |
| 면책 한 줄 | 패널 하단 작은 글씨 |
| 액션 | 수정(로그인) · 영업 종료 · 삭제(본인만) · 오늘 확인함 |

- 비로그인에서 수정·삭제·확인 → D 후 복귀
- 수정 모드: 같은 패널 안에서 태그·메모 편집. **취소** 또는 Esc로 편집만 종료. 식단 0개면 저장 비활성
- 오늘 이미 확인한 곳은 **오늘 확인됨**으로 버튼을 비활성
- 영업시간 블록은 만들지 않음. 카카오맵 링크로 대체

### 9.3 화면 C — 등록

데스크톱: **우측 패널** (상세 B와 같은 슬롯). 모바일: 바텀시트.

1. 미로그인이면 D를 먼저
2. 상단과 같은 톤의 검색으로 카카오 장소 → 이름·주소 리스트
3. 이미 있는 `place_id` → `이미 올라간 곳이에요.` + 해당 핀·패널로 이동
4. diet ≥1 + cuisine/venue + 메모. Google 이름 사용(닉네임 입력 없음)
5. 저장 → 닫고 새 핀으로 지도 이동 + 패널 오픈

### 9.4 화면 D — Google 로그인

- 짧은 모달/시트: `식당을 올리거나 고치려면 Google 계정이 필요해요.` + **Google로 계속하기**
- 성공 후 `returnTo` (등록 또는 수정)
- 취소 → 지도. 실패 → `로그인에 실패했어요. 다시 시도해 주세요.`

### 9.5 빈 상태·에러 (Must에 포함)

| 상황 | 메시지 |
|------|--------|
| 시드 전 / 핀 0 | 면책 + `아직 등록된 곳이 없어요. 첫 식당을 올려 주세요.` |
| 검색 0건 | `검색 결과가 없어요. 상호를 바꿔 보세요.` |
| 카카오 키/도메인 오류 | `지도를 불러오지 못했어요.` |
| 삭제 권한 없음 | 삭제 버튼 숨김 |
| 세션 만료 후 저장 | `다시 로그인해 주세요.` → D |

---

## 10. 데이터 모델 (Supabase)

### 10.1 `spots`

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | 내부 ID |
| `place_id` | `text` | **UNIQUE NOT NULL** | 카카오 장소 ID. 중복 등록 차단 |
| `name` | `text` | NOT NULL | 상호 (카카오) |
| `address` | `text` | | 도로명 우선, 없으면 지번 (카카오) |
| `lat` | `double precision` | NOT NULL | 카카오 `y` |
| `lng` | `double precision` | NOT NULL | 카카오 `x` |
| `diet_tags` | `text[]` | NOT NULL, **길이 ≥ 1**, 값은 프리셋만 | |
| `cuisine_tags` | `text[]` | default `{}` | |
| `venue_tags` | `text[]` | default `{}` | |
| `memo` | `text` | default `''`, **CHECK length ≤ 300** | 한국어 메모 |
| `memo_en` | `text` | default `''`, **CHECK length ≤ 300** | 영문 메모 |
| `phone` | `text` | | 카카오 전화번호 |
| `place_url` | `text` | | 카카오 장소 페이지 |
| `closed` | `boolean` | default false | 영업 안 함 |
| `trust` | `text` | `unverified` \| `listed` | 미확인 / 외부 목록 제보 |
| `last_confirmed_at` | `timestamptz` | | 전화·방문 확인 시각. 확인만 하면 `updated_at`은 안 올림 |
| `last_confirmed_by` | `uuid` | | |
| `last_confirmed_nickname` | `text` | | |
| `created_by` | `uuid` | NOT NULL, `auth.users.id` | 삭제 권한의 기준 |
| `created_by_nickname` | `text` | NOT NULL | 등록 시점 Google 표시 이름 스냅샷. 이메일은 저장·공개하지 않음 |
| `last_edited_by` | `uuid` | | |
| `last_edited_nickname` | `text` | | |
| `source` | `text` | `seed` \| `user`, default `user` | 시드와 UGC 구분. **인증 배지는 아님** |
| `created_at` | `timestamptz` | default `now()` | |
| `updated_at` | `timestamptz` | default `now()` | 트리거로 갱신 |

인덱스: `place_id`(unique), `(lat, lng)` (나중에 bbox 조회용).  
1차는 건수가 적어 **spots 전체 select 후 클라이언트 필터**로 충분. 전국 확대 시 `lat/lng BETWEEN` 또는 PostGIS.

태그 값은 DB `CHECK` 또는 앱 단 화이트리스트. **커스텀 태그 저장 금지.**

### 10.2 시드 작성자

시드도 `created_by`가 필요하다. 운영자가 **본인 Google로 한 번 로그인**한 뒤, 그 `auth.users.id`로 시드를 insert한다.  
시드 삭제는 그 Google 계정 또는 SQL. 일반 사용자는 시드 글을 삭제하지 못한다. (관리 화면 Won't와 일치)

### 10.3 조회량·신고 테이블

1차 **안 만듦**. 신고(Could) 때 `reports(spot_id, reason, created_at)` 추가.

---

## 11. 인증·RLS (핵심)

등록·수정 주체는 **Google 계정**이다. 조회는 비로그인. 이메일/비번 폼과 Anonymous Auth는 쓰지 않는다.

**확정 해석**

| 개념 | 구현 |
|------|------|
| 표시 이름 | Google 프로필. 폴백 `user_metadata.full_name` → `user_metadata.name` → `사용자`. 등록/수정 시 `*_nickname`에 스냅샷 |
| 작성자 | Supabase Auth `auth.uid()` (Google provider) |
| 조회 | 로그인 불필요 (anon key + SELECT 공개) |
| 등록/수정 | Google 세션 필수. 없으면 화면 D |
| 삭제 | `created_by = auth.uid()` 일 때만. **같은 Google 계정이면 다른 기기에서도 가능** |
| 이메일 | Auth에만 존재. UI·spots 테이블에 넣지 않음 |

### 11.1 OAuth 흐름 (Next.js + Supabase)

1. 클라이언트: `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: '{origin}/auth/callback' } })`
2. Google 동의 화면 → Supabase `{project}.supabase.co/auth/v1/callback`
3. 앱 `/auth/callback`이 `code`를 세션으로 교환 후 `returnTo`로 리다이렉트  
   - `returnTo`는 OAuth 시작 전 **sessionStorage**에 저장 (`register` | `edit:{spotId}` | `/`). 쿼리로도 넘길 수 있으나 1차는 sessionStorage
4. `middleware.ts`로 쿠키 세션 갱신 (`@supabase/ssr`)

**콘솔 설정 (필수)**

| 위치 | 할 일 |
|------|--------|
| [Google Cloud Console](https://console.cloud.google.com) | OAuth 클라이언트(웹) 생성. 승인된 리디렉션 URI = `https://<project-ref>.supabase.co/auth/v1/callback` |
| Supabase Auth → Providers → Google | Client ID / Secret 입력, Enable |
| Supabase Auth → URL Configuration | Site URL = `http://localhost:3000` (배포 후 Vercel URL). Redirect Allow List에 `http://localhost:3000/auth/callback`, `https://<vercel>/auth/callback` |
| Google OAuth 동의 화면 | 외부 테스트면 테스트 사용자에 본인 Gmail 추가. 출시 전 앱 검증은 1차에서 테스트 모드로 충분할 수 있음 |

Anonymous sign-ins는 **끄기**.

### 11.2 RLS · 컬럼 보호 (확정)

- `SELECT`: `true` (공개)
- `INSERT`: `auth.uid() IS NOT NULL` AND `created_by = auth.uid()` AND `cardinality(diet_tags) >= 1`
- `UPDATE`: `auth.uid() IS NOT NULL` AND `cardinality(diet_tags) >= 1` (수정 후에도 식단 최소 1개)
- `DELETE`: `created_by = auth.uid()`

**컬럼 변조 방지 (DB 트리거, Must)**  
Postgres RLS만으로는 컬럼 단위 UPDATE를 막기 어렵다. `BEFORE UPDATE` 트리거로 아래 컬럼이 바뀌면 `RAISE EXCEPTION`:

`place_id`, `name`, `created_by`, `created_by_nickname`, `source`

앱은 태그·메모·주소·좌표(위치 고치기)·`last_edited_*`·`updated_at`·확인 스탬프를 보낸다.  
확인만 한 UPDATE는 `updated_at`을 올리지 않는다.  
`memo`/`memo_en` 길이 ≤ 300, 태그 값은 프리셋 화이트리스트 — CHECK 또는 트리거로 검증.

Google로 로그인한 사용자만 `authenticated` 역할. 비로그인 anon 키는 SELECT만.

---

## 12. 카카오맵 연동

| 키 | 용도 | 노출 |
|----|------|------|
| JavaScript 키 | 지도 렌더 + (가능하면) Places 검색 | `NEXT_PUBLIC_KAKAO_JS_KEY` |
| REST 키 | JS 검색이 막힐 때만 서버 프록시 | 서버 전용 `KAKAO_REST_KEY` (NEXT_PUBLIC 금지) |

필수 작업: [카카오 디벨로퍼스](https://developers.kakao.com) 앱 → 플랫폼에 `http://localhost:3000` 과 Vercel 도메인 등록. 안 하면 지도 빈 화면.

Next.js 주의: `window.kakao`는 클라이언트 전용. 맵 컴포넌트는 `ssr: false`. 스크립트 로드 완료 콜백 후에 `new kakao.maps.Map`.

등록 시 저장할 카카오 필드: `id`(placeId), `place_name`, 주소는 **`road_address_name` 우선 · 없으면 `address_name`**, `y`(lat), `x`(lng).  
좌표: 카카오는 보통 `x`=경도, `y`=위도 — DB `lng`←`x`, `lat`←`y`.

---

## 13. 환경 변수·폴더 구조

```
.env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_KAKAO_JS_KEY=
NEXT_PUBLIC_SITE_URL=    # OG/메타용, 없으면 Vercel URL
KAKAO_REST_KEY=          # 프록시 쓸 때만
```

제안 구조:

```
app/page.tsx                  # 지도 셸
app/layout.tsx
app/auth/callback/route.ts    # Google OAuth code → session
app/api/places/route.ts       # REST 프록시(대안)
middleware.ts                 # Supabase 세션 쿠키 갱신
components/map/KakaoMap.tsx
components/map/SpotMarker.tsx
components/shell/SearchBar.tsx
components/shell/FilterChips.tsx
components/shell/PlaceCountBadge.tsx
components/shell/DisclaimerBar.tsx
components/shell/ShareButton.tsx
components/shell/IntroModal.tsx
components/shell/LanguageSelect.tsx
components/spot/NearbyList.tsx
components/spot/DetailPanel.tsx      # 데스크톱 우측 / 모바일 바텀시트
components/spot/RegisterSheet.tsx
components/auth/LoginSheet.tsx
components/auth/UserMenu.tsx
lib/supabase/client.ts
lib/supabase/server.ts
lib/tags.ts
lib/types.ts
supabase/migrations/0001_spots.sql
docs/ui-reference/                 # 첨부 레퍼런스 스크린샷 보관(선택)
```

`.env*` 는 git에 넣지 않는다. `anon key`는 브라우저에 나가도 되고, **보호는 RLS**가 한다.

---

## 14. 3주 일정 (Must만)

| 주 | 목표 |
|----|------|
| 1 | 프로젝트 생성, spots+RLS, **Google OAuth**, 카카오맵 표시, 시드 2~3곳으로 핀 확인 |
| 2 | 로그인 게이트, 검색 등록·중복 차단·식단 필수·필터 AND/OR·팝업 수정/삭제·면책 UI |
| 3 | 확인된 시드 ~20, 모바일 다듬기, Vercel 배포, 카카오·Google Redirect, 빈 상태/에러 |

시드 전화/방문 확인은 구현과 **병렬**. 주 3 배포 전에 안 끝나면 확인된 것만 넣고, 미확인은 올리지 않는다.

---

## 15. 신뢰·남용 (1차 최소)

관리 화면 없음 + 로그인 유저 위키 수정 = 할랄 태그가 틀어질 수 있다. Google 계정이 묶여 익명 닉네임보다는 추적이 쉽다.

1차에서 하는 것:

- 면책 문구 상시 노출
- 시드는 `source=seed` + 메모에 확인 방법·날짜. 팝업에 작은 글씨 `운영 확인(공식 인증 아님)` 정도는 가능. **인증 배지처럼 보이지 않게**
- UGC는 `source=user`, 배지 없음
- `updated_at` / 마지막 수정 이름·날짜 표시 (**Must**)

1차에서 안 하는 것: 신고, 롤백 히스토리, 레이트 리밋 UI.  
배포 후 악의적 수정이 보이면 Supabase SQL로 되돌린다.

---

## 16. 결정사항 정리

### 16.1 확정 (권장안 반영 · 구현 시 그대로)

| # | 항목 | 결정 |
|---|------|------|
| 1 | 쓰기 권한 | 조회 공개 · **등록·수정은 Google 로그인** · 삭제는 작성자만 |
| 2 | 표시 이름 | Google 이름. 폴백 `full_name` → `name` → `사용자`. 이메일 비공개 |
| 3 | 닉네임 입력란 | **없음** |
| 4 | 수정 범위 | **태그·메모·주소·좌표(위치 고치기)**. 상호·placeId·원등록자·source는 불변. 할랄은 원등록자만 |
| 5 | 컬럼 보호 | 앱만 믿지 않음 → **BEFORE UPDATE 트리거**로 불변 컬럼 변경 거부 |
| 6 | 식단 태그 | 등록·수정 모두 `diet_tags` **≥ 1**. 채식 필터는 비건 매장 포함 |
| 7 | 중복 등록 | `place_id` UNIQUE |
| 8 | 필터 기본 | **칩 없음 = 전체 표시**. 식단 AND · 음식/유형 OR. **필터 지우기** |
| 9 | 상단 검색바 | **등록된 상호 검색**. 카카오 등록은 ＋ 등록 |
| 10 | 주소 | **도로명 우선**, 없으면 지번. `lat`←`y`, `lng`←`x`. 위치 고치기 가능 |
| 11 | 마지막 수정 표시 | **Must** (이름 + 날짜). 별도로 **오늘 확인함** 스탬프 |
| 12 | 상세 UI | 데스크톱 우측 패널 · 모바일 바텀시트 |
| 13 | 핀 색 | **딥 그린** `#1B7A4E` 단일 |
| 14 | 내 위치 버튼 | **포함**. GPS 우선, 실패 시 IP. 한반도 밖이면 지도는 안 옮김 |
| 15 | 배포 | **Vercel** (`https://diet-spot-ko.vercel.app`) |
| 16 | UI 언어 | 화면 전체 KO/EN + 식단 태그 한/영 병기 |
| 17 | OAuth returnTo | **sessionStorage** (`register` / `edit:{id}` / `confirm:{id}` / `relocate:{id}`) |
| 18 | 지도 | 카카오맵 (레퍼런스 Google Maps UI만 참고) |
| 19 | Anonymous / 이메일가입 / 카카오로그인 | **안 함** |
| 20 | 시드 | 본인 전화·방문 확인분 + 공개 목록 시드는 `trust=listed` |
| 21 | 첫 방문 안내 | 정중앙 모달. 시작하기/다시 보지 않기 → 재표시 안 함 |
| 22 | 가까운 곳 | 좌하단, 기본 접힘 |
| 23 | 길찾기 | 카카오맵 링크만. 앱 내 내비 없음 |

### 16.2 아직 열려 있음 (착수 전·중에 고르면 됨)

| # | 질문 | 권장 | 영향 |
|---|------|------|------|
| A | 패키지 매니저 | **npm** (기본) 또는 pnpm | 설치 명령만 다름 |
| B | 등록 UI 위치 (데스크톱) | **우측 패널** (상세와 동일 슬롯) | 중앙 모달보다 레퍼런스와 맞음 |
| C | Should: 등록 상호 검색을 1차에 넣을지 | **넣음** (상단 검색 = 등록된 곳) | 검색과 등록 입구를 나눔 |
| D | 필터 URL 공유 (`?diet=halal`) | **넣음** | `?diet=` `?spot=` `?lang=` |
| E | Next.js 버전 | create-next-app 시점의 **최신 안정** (15.x) | 문서의 “15”와 동일 취지 |
| F | 시드 등록 방식 | 운영자 Google 로그인 후 앱 UI 또는 SQL | 둘 다 OK. UUID만 맞으면 됨 |

### 16.3 착수 계정 (키는 `.env.local`만)

1. Supabase — Google provider ON, Anonymous OFF  
2. Google Cloud — OAuth 웹 클라이언트 + 동의 화면  
3. 카카오 디벨로퍼스 — JS 키 + `localhost:3000` / Vercel 도메인  
4. Vercel — 배포 후 Redirect URL 갱신  

**구현 가능도:** 위 16.1이 반영된 상태 기준 **착수 가능**. 16.2는 코딩하며 골라도 Must에 막히지 않는다.

---

## 17. 구현 반영 (출시 이후 UX)

배포본(`https://diet-spot-ko.vercel.app`) 기준으로 초안 명세와 달라진 점.

| 항목 | 초안 | 구현 |
|------|------|------|
| 상단 검색 | 등록(C) 입구 | **등록된 곳** 검색. 카카오는 ＋ 등록 |
| UI 언어 | 한글 + 태그 병기 | 화면 전체 KO/EN. 모바일 버튼은 바꿀 언어를 표시 |
| 공유 | Could, 1차 제외 | 헤더·상세 공유. 아이콘은 오른쪽 꺾인 화살표. `?diet=` `?spot=` `?lang=` |
| 내 위치 | 1차 제외 | GPS/IP 버튼. 한반도 밖이면 지도는 고정 |
| 길찾기 | Won't | 카카오맵 길찾기 **링크**만 |
| 면책 | 지도 하단 상시 | 안내 모달·상세. 데스크톱만 지도 하단. 모바일 지도는 가리지 않음 |
| 가까운 곳 | 없음 | 좌하단 목록. **기본 접힘**, 탭으로 열고 닫음 |
| 첫 방문 | 없음 | 정중앙 모달. 시작하기/다시 보지 않기 → 재표시 안 함. 바깥·×는 이번만 |
| 필터 0건 | 토스트만 | 토스트 + **필터 지우기**. 위치는 칩 아래 |
| 상세 전화 | 텍스트 | `tel:` 로 걸기. 주소 **복사** |
| 수정 | 저장만 | **취소** · Esc는 편집만 종료 후 패널 유지 |
| 오늘 확인 | 없음 | 위키 스탬프. 같은 날 재클릭 불가 |
| 로그인 시트 | 바깥 탭으로 안 닫힘 | Esc·바깥 탭으로 닫힘 |

마이그레이션은 `supabase/migrations/0001`–`0013`을 번호 순으로 적용한다.

