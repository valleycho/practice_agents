# 프로젝트 아키텍처 (Architecture)

이 프로젝트는 **FSD (Feature-Sliced Design)** 아키텍처 방법론을 지향하며, Next.js App Router 환경에 맞게 변형하여 적용합니다. 
AI 에이전트는 애플리케이션의 코드를 생성, 수정, 리팩토링할 때 반드시 아래의 폴더 구조와 계층(Layer) 간 단방향 의존성 규칙을 엄격하게 지켜야 합니다.

---

## 1. 계층 (Layers) 구조 및 역할

FSD의 원칙에 따라 프로젝트는 아래 5가지 주요 계층으로 나뉩니다.
**아래 계층으로 갈수록 비즈니스 로직에 대한 의존성이 낮아지고 재사용성이 높아집니다.** (상위 계층은 하위 계층을 import할 수 있지만, 반대는 절대 불가합니다.)

### 1) `app` (Next.js Routing & Global Init)
- **역할**: Next.js의 파일 기반 라우팅 진입점, 글로벌 레이아웃, 전역 프로바이더(`providers.tsx`), 전역 스타일(`globals.css`) 등을 담당합니다.
- **포함 내용**: `page.tsx`, `layout.tsx`, 앱 전역 초기화 로직 등

### 2) `widgets` (독립적인 단위 화면/UI 블록)
- **역할**: 하위 계층에 있는 여러 `features`와 `entities`를 조합하여 만든 독립적이고 완성된 커다란 컴포넌트 블록입니다. 
- **예시**: `Header`, `Sidebar`, `UserProfileCard`, `ProductListBoard`

### 3) `features` (사용자 상호작용 및 비즈니스 기능 동작)
- **역할**: 사용자에게 실질적인 비즈니스 가치를 제공하는 특정 액션/기능 단위입니다. 폼 제출, 버튼 이벤트 등의 인터랙션을 다룹니다.
- **예시**: `Auth` (로그인 폼 동작), `AddToCart` (장바구니 담기 동작), `SortProducts` (정렬 필터링)

### 4) `entities` (비즈니스/도메인 주도 엔티티)
- **역할**: 비즈니스 도메인의 핵심 데이터 모델, 공통 UI, 패칭 훅(`useQuery`) 등입니다. 인터랙션보다는 "데이터 그 자체와 화면의 표현 방식"에 집중합니다.
- **예시**: `User` (사용자 타입, API 패칭, 프로필 이미지 UI), `Product` (상품 데이터, 단일 상품 카드 UI)

### 5) `basics` (가장 기초적인 공용 자원 - 구 `shared`)
- **역할**: 프로젝트 전반에서 재사용되는 가장 기초적인 요소들입니다. **⚠️ 주의: 기존 FSD의 `shared` 계층 명칭을 이 프로젝트에서는 `basics`로 변경하여 사용합니다.**
- **포함 내용**:
  - `ui/`: 애플리케이션 종속성이 없는 기본 디자인 시스템 컴포넌트 (shadcn/ui 버튼, 인풋 등)
  - `lib/`: 유틸리티 함수 (`cn()`, 날짜 포맷팅 등)
  - `api/`: axios 인스턴스, 공통 API 에러 처리 로직
  - `config/`: 환경 변수 설정
  - `types/`: 전역 공통 타입 정의

---

## 2. 슬라이스 내부 구조 (Segments)

각 계층(`features`, `entities` 등) 내부에 존재하는 개별 모듈(슬라이스)은 다시 역할에 따라 아래와 같은 세부 폴더(Segments)로 나뉠 수 있습니다.

- **`ui/`**: UI 컴포넌트 파일들 (`.tsx`)
- **`model/`**: **(중요)** 비즈니스 로직과 상태 관리를 담당하는 **커스텀 훅(Custom Hooks)** 모음입니다. 
  - **주요 용도**: TanStack Query를 이용한 API 패칭 훅(`useQuery`, `useMutation`), Zustand 전역 상태, 혹은 해당 슬라이스 영역 내에서 공용으로 쓸 만한 로직 훅들을 이곳에 정리합니다.
  - **예시**: `useGetUser.ts`, `useLoginMutation.ts`, `userStore.ts`
- **`api/`**: 해당 도메인/기능에 특화된 API 호출 함수들 (`axios`, `fetch` 등)
- **`lib/`**: 해당 도메인/기능 내에서만 쓰이는 유틸리티나 헬퍼 함수

---

## 3. 의존성 규칙 (Dependency Rules) - 🚨 절대 원칙

AI는 컴포넌트를 분리하거나 import 경로를 설정할 때 다음 규칙을 예외 없이 준수해야 합니다.

1. **단방향 하향 의존성**: 모듈은 항상 자신보다 하위 계층(아래쪽)의 모듈만 임포트(Import)할 수 있습니다.
   - `app` ➡️ `widgets` ➡️ `features` ➡️ `entities` ➡️ `basics`
   - ❌ **예외 불가**: `entities`에서 `features`를 임포트하거나, `basics`에서 `entities`를 임포트하면 아키텍처가 붕괴됩니다.
2. **동일 계층 내 의존성 지양**: 같은 슬라이스 계층(예: `features/auth`와 `features/cart`) 간의 직접적인 교차 임포트는 강한 결합을 유발하므로 피해야 합니다. 여러 기능을 묶어야 한다면 상위 계층인 `widgets` 또는 `app`에서 조합해야 합니다.
3. **Public API (Barrel Pattern) 노출 제한**: 각 슬라이스 폴더는 내부에 `index.ts`를 두고, 이 폴더를 외부에서 쓸 때 필요한 컴포넌트, 훅, 타입만 내보냅니다. 외부 모듈에서 슬라이스 내부의 깊은 경로(`features/auth/ui/LoginForm.tsx`)를 직접 참조하지 않아야 합니다. 특히 `model`에서 정의된 커스텀 훅들도 `index.ts`를 통해 깔끔하게 내보내는(export) 것을 권장합니다.

---

## 4. 디렉토리 구조 예시 (Next.js App Router 기준)

```text
src/
├── app/                  # 최상위 Next.js 라우팅 페이지 및 레이아웃
├── widgets/              # 복합 구조를 가진 화면 컴포넌트 블록
│   └── header/
├── features/             # 구체적 사용자 인터랙션 및 비즈니스 기능
│   └── auth/ 
│       ├── ui/           # 로그인 폼 타이핑 UI
│       └── model/        # auth와 관련된 커스텀 훅 (ex: useLoginMutation 등)
├── entities/             # 도메인 모델, 도메인 UI 컴포넌트
│   └── user/
│       ├── ui/           # 사용자 프로필 카드 등
│       ├── model/        # TanStack Query를 활용한 useUser 데이터 패칭 훅
│       └── api/          # user 도메인 특화 api 호출 로직
└── basics/               # ⚠️ (구 shared) 가장 코어한 공용 자원 및 UI 프리미티브
    ├── ui/               # 기본 UI 구성 요소들
    ├── lib/              # 공통 유틸 
    └── api/              # 공통 HTTP 클라이언트
```

---

## 5. Next.js App Router 심화 아키텍처 규칙 (AI 필수 숙지)

### 1) ⚛️ 서버 / 클라이언트 컴포넌트 (RSC 가이드)
- **서버 컴포넌트 우선 원칙**: `app` 계층의 라우팅 파일(`page.tsx`, `layout.tsx`)은 항상 서버 컴포넌트로 유지하여, 초기 렌더링 성능 최적화와 SEO를 확보한다.
- **클라이언트 바운더리 최소화**: 상태 관리나 이벤트 핸들링 등이 필요한 경우, `widgets`나 `features` 계층에서 최상단 래퍼 컴포넌트에만 `"use client"`를 명시하여 상태 관리 범위를 고립시킨다.

### 2) 🗄️ 데이터 페칭 (Data Fetching) 전략
- **초기 로드/서버 단 페칭**: SEO가 중요하거나 브라우저 렌더 전 로드가 필요한 초기 데이터는 `app` 계층의 페이지 서버 컴포넌트에서 직접 페칭(fetch)한 후, 하위 컴포넌트로 Prop으로 전달한다.
- **클라이언트 상태 패칭**: 사용자의 인터랙션으로 실시간 업데이트/재조회가 필요한 데이터는 `features` 단이나 `entities/model` 내에 있는 클라이언트 상태 관리 라이브러리(TanStack Query의 `useQuery` 등)를 통해 훅(Hook)으로 가져온다.

### 3) 🚧 예외 처리 및 로딩 상태 (Error & Suspense Boundary)
- **전역 페이지 레벨**: 라우트 단위의 굵직한 로딩이나 에러는 `app` 계층의 `loading.tsx`와 `error.tsx` 파일 라우팅 규칙을 사용한다.
- **부분 UI 블록 레벨**: 독립적으로 비동기 처리가 필요한 위젯이나 기능 영역은 부분적인 렌더 블록 처리를 위해, `widgets` 혹은 적용 화면 레벨에서 `React.Suspense`와 `ErrorBoundary`로 해당 컴포넌트를 감싸서 처리한다.

### 4) 🪝 타입 (Types) 및 DTO 정의 위치
- **종속 타입 (도메인 특정)**: 특정 도메인 컨텍스트(예: `User`, `Product`)에 강하게 종속된 타입 및 인터페이스는 해당 슬라이스 내부의 `entities/{도메인}/model` 디렉토리에 정의한다.
- **공통 타입 (전역 범용)**: 여러 도메인에서 공통적으로 쓰이는 범용 타입(예: API Response 공통 래퍼 포맷, 페이징 데이터 포맷 등)은 `basics/types/` 하위에서 관리한다.

### 5) 🧩 UI 컴포넌트의 책임 분리 (Presentational & Container)
- **순수 UI 컴포넌트 (Presentational)**: `ui/` 폴더 내에 위치하는 컴포넌트들은 가급적 로직(API 호출, 복잡한 상태) 없이 화면을 그리는 역할에만 집중해야 한다. 외부에서 Prop(`data`, `onClick` 등)을 주입받아 동작하게 하여 재사용성과 테스트 용이성을 극대화한다.
- **로직 컴포넌트 (Container)**: 복잡한 상태 처리나 비즈니스 페칭 로직 등은 상위의 부모 컴포넌트 혹은 `model/`의 커스텀 훅(Hook)으로 분리하여 순수 UI 컴포넌트에 필요한 데이터만 Prop으로 내려준다.

### 6) 🗂️ 배럴 파일(Barrel File, `index.ts`) 최적화 및 주의사항
- **순환 참조 방지**: 슬라이스의 Public API를 노출(export)하는 `index.ts` 내부에서는, 절대 다른 슬라이스의 `index.ts`를 교차 임포트하지 않는다. 컴포넌트 렌더링 에러나 모듈 로딩 순서 꼬임을 유발할 수 있다.
- **트리 쉐이킹(Tree-Shaking) 고려**: `basics/ui`와 같이 독립적인 소형 컴포넌트(버튼, 모달, 인풋 등)가 많은 곳에서 거대한 단일 `index.ts` 파일로 수십 개의 컴포넌트를 한꺼번에 export 하는 것은 지양한다. 필요한 곳에서 각각의 모듈 명(ex: `import { Button } from '@/basics/ui/button'`)을 직접 임포트하여 불필요한 번들 사이즈 증가를 방지한다.
