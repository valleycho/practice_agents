# 프로젝트 기술 스택 (Tech Stack)

AI 에이전트는 이 프로젝트에서 코드를 작성하거나 수정할 때 반드시 아래 명시된 기술 스택과 규칙을 준수해야 합니다.

## 1. Core Framework & Language
- **Framework**: Next.js 16 (App Router 전용)
- **Language**: TypeScript (Strict Mode 적용, `any` 타입 금지, 제네릭/`unknown` 적극 활용)

## 2. Styling & UI
- **Styling**: Tailwind CSS v4
- **UI Architecture**: shadcn/ui 패턴 활용 (Headless UI + Tailwind)
- **Utility**: `class-variance-authority` (cva), `clsx`, `tailwind-merge` (`cn()` 유틸리티 함수) 조합 사용
- **Rule**: 인라인 스타일(inline-style) 작성은 절대 금지하며, 오직 Tailwind CSS 클래스만을 사용합니다.

## 3. State Management (상태 관리)
- **Server State (데이터 패칭, 동기화, 캐싱)**: TanStack Query (React Query)
- **Query Key Management**: `@lukemorales/query-key-factory`
  - **Rule**: TanStack Query 사용 시 하드코딩된 문자열 키 사용을 지양하고, 반드시 `query-key-factory`를 이용해 안전하고 일관된 쿼리 키(Query Key)를 생성 및 관리합니다.
- **Client Global State**: Zustand
- **Rule**: 상태 관리 우선순위
  1순위: Server State (TanStack Query) - 서버(API)와 동기화되는 데이터
  2순위: Local State (`useState`) - UI 토글 등 해당 컴포넌트 내에서만 쓰이는 상태
  3순위: Global State (Zustand) - 여러 컴포넌트에 걸쳐 전역적으로 공유되어야만 하는 클라이언트 상태

## 4. Forms & Validation
- **Form Handling & Validation**: React Hook Form + Zod
  - **Rule**: 복잡한 폼 상태 관리는 반드시 `react-hook-form`을 사용하며, 유효성 검증(Validation) 로직은 `zod` 스키마베이스로 작성하여 `zodResolver`를 통해 폼에 연동합니다.

## 5. Testing
- **Unit Test (단위 테스트)**: Vitest
  - **Rule**: 컴포넌트나 함수의 비즈니스 로직 테스트를 작성하며, 테스트 파일은 `*.test.tsx` (또는 `.test.ts`) 형식으로 테스트 대상 파일과 동일한 위치(Co-location)에 생성합니다.
- **E2E Test (단대단 테스트)**: Playwright
  - **Rule**: 사용자 시나리오 기반의 브라우저 통합 테스트는 프로젝트 루트의 `/e2e` 폴더 내에 작성합니다.

## 6. Data Fetching & Backend
- **Backend/BaaS**: Supabase (BaaS) 또는 별도의 커스텀 백엔드 API 서버 (REST API 등) 프로젝트 상황에 맞게 유동적으로 선택
- **API Client**: `axios`
  - **Rule**: 외부 백엔드 API 또는 내부 API 라우트 통신 시 `axios`를 기본 HTTP 클라이언트로 사용합니다.
  - **Rule**: 인증 토큰 처리(Bearer Token), 공통 에러 핸들링 로직 등은 반드시 `axios` 인터셉터(Interceptor)를 통해 중앙에서 공통으로 제어합니다.
