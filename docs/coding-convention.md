# 코딩 컨벤션 (Coding Conventions)

이 프로젝트의 일관된 코드 품질 유지보수성과 가독성을 위해 작성된 코딩 가이드라인입니다. 
AI 에이전트 및 모든 개발자는 코드를 작성하거나 수정할 때 반드시 아래의 규칙을 준수해야 합니다.

---

## 1. 명명 규칙 (Naming Conventions)

- **폴더 및 파일명 (Files & Directories)**
  - **컴포넌트 파일 (`.tsx`)**: `PascalCase` 사용 (예: `UserProfile.tsx`, `ProductCard.tsx`)
  - **로직/유틸 파일 (`.ts`)**: `kebab-case` 사용 (예: `format-date.ts`, `auth-store.ts`)
  - **폴더명**: `kebab-case` 사용 (예: `user-profile`, `components`)

- **변수 및 함수 (Variables & Functions)**
  - 기본적으로 `camelCase`를 사용합니다. (예: `userData`, `fetchProductList()`)
  - **Boolean 변수**: `is`, `has`, `should` 등의 접두사를 붙입니다. (예: `isVisible`, `hasError`)

- **상수 (Constants)**
  - 전역 상수 및 하드코딩된 설정값은 `UPPER_SNAKE_CASE`를 사용합니다. (예: `MAX_UPLOAD_SIZE`, `API_BASE_URL`)

- **타입 및 인터페이스 (Types & Interfaces)**
  - `PascalCase`를 사용합니다. (예: `UserProfileProps`)
  - ❌ `T` 나 `I` 와 같은 접두사(Prefix)는 사용하지 않습니다. (예: `IUser` (X) ➡️ `User` (O))

---

## 2. 컴포넌트 및 함수 선언 (Component & Function Declaration)

- **컴포넌트 선언 방식**: `export const`와 화살표 함수(Arrow Function) 화살표 형태를 기본으로 사용합니다.
  - Next.js의 `page.tsx`, `layout.tsx` 같이 `default export`가 강제되는 프레임워크 예약 파일만 예외로 둡니다.
  ```tsx
  // ✅ Good
  export const UserCard = () => { ... }
  
  // ❌ Bad (일반 컴포넌트에 default export 사용 지양)
  export default function UserCard() { ... }
  ```

---

## 3. 타입스크립트 (TypeScript) 규칙

- **`type` vs `interface`**
  - 가급적 `type` 위주로 사용합니다. 선언 병합(Declaration Merging)이 꼭 필요한 라이브러리 타입 확장의 경우에만 `interface`를 사용합니다.
- **`any` 타입 사용 절대 금지**
  - 타입을 미리 알 수 없는 경우 `unknown`을 사용하고, 타입 가드(Type Guard) 및 타입 좁히기(Type Narrowing)를 통해 런타임 안정성을 확보합니다.
- **`enum` 사용 지양**
  - 번들러의 트리쉐이킹(Tree-shaking) 이슈를 방지하기 위해 `enum` 대신 리터럴 유니온 타입(`type Status = 'IDLE' | 'LOADING'`) 또는 `as const` 단언을 사용한 상수 객체를 활용합니다.

---

## 4. 로직 처리 (Early Return 원칙)

- 가독성을 위해 불필요한 `if-else` 중첩을 피하고 빠른 반환(Early Return) 패턴을 강제합니다.
  ```tsx
  // ✅ Good: 예외 사항을 먼저 차단하여 깊이를 줄임
  if (!user) return <LoginFallback />;
  if (user.isBanned) return <AccessDenied />;
  
  return <Dashboard />;
  
  // ❌ Bad: 불필요한 중첩 (Arrow code)
  if (user) {
    if (!user.isBanned) {
      return <Dashboard />;
    } else {
      return <AccessDenied />;
    }
  } else {
    return <LoginFallback />;
  }
  ```

---

## 5. 훅 및 상태 관리 (Hooks & State)

- **Custom Hook 명명**: 항상 `use` 접두사로 시작합니다. (예: `useAuth`, `useFetchUser`)
- **Zustand Store**: 각 슬라이스의 `model/` 폴더 내에 위치시키며, 컴포넌트 간에 전역(Global)으로 공유되어야만 하는 상태만 관리합니다.
- **TanStack Query (React Query)**
  - 쿼리 키(Query Key)는 문자열 하드코딩을 절대 금지하고, `@lukemorales/query-key-factory`를 활용하여 생성합니다.
  - 데이터 패칭 로직(커스텀 훅)은 UI 컴포넌트 파일에 직접 작성하지 않고, 슬라이스의 `model/` 폴더 내로 완전히 분리합니다.

---

## 6. 주석 및 문서화 (Korean First)

- **1순위는 완벽한 변수명**: 주석 없이 작동 방식을 이해할 수 있도록 명확한 함수/변수명을 고민합니다. (What은 코드로 설명)
- **주석의 역할 (Why)**: "이 로직이 왜 여기에 들어가야만 했는지?", "버그 워크어라운드(Workaround)인지?" 등 맥락(Context)을 설명할 때만 보조적으로 주석을 남깁니다.
- **한국어 작성 원칙**: 프로젝트의 유지보수를 위해 코드 내의 **모든 주석과 JSDoc 설명은 한국어**로 작성합니다. 복잡한 유틸리티 함수의 경우 JSDoc(`/** ... */`) 구문을 활용해 파라미터와 반환값을 설명합니다.

---

## 7. Import 순서 및 FSD 규칙 

파일 최상단의 Import 선언문은 결합도가 낮고 외부 요소인 것부터, 내부적이고 결합도가 높은 순으로 정렬합니다. eslint 정렬 플러그인을 활용하는 것을 권장합니다.

1. **외부 모듈 (External/Vendor)**
   - `react`, `next`, `next/*` (React 및 Next 생태계 코어)
   - 서드파티 라이브러리 (예: `zustand`, `axios`, `clsx`, `@tanstack/react-query`)
2. **절대 경로 (Absolute/Internal)** ➡️ FSD 계층 역순으로 (하위 계층일수록 위쪽에 위치)
   - `@/basics/*` (가장 범용적인 디자인 로직, 유틸 등)
   - `@/entities/*` (도메인 데이터, 공통 모델)
   - `@/features/*` (비즈니스 인터랙션 기능)
   - `@/widgets/*` (복합 화면 구성요소)
3. **상대 경로 (Relative)**
   - 파일 내 `../` 및 `./` 로 시작하는 하위 컴포넌트, 동일 슬라이스의 폴더

> **🚨 (중요) FSD 계층 원칙 재확인**:
> 상위 모듈 그룹(`features`)에서 절대 경로를 사용해 하위 모듈(`entities`, `basics`)을 가져오는 것은 가능하지만,  
> 하위 모듈(`basics`)에서 상위 모듈(`features`)을 Import하면 순환 참조(Circular Dependency) 및 아키텍처 규칙 위반으로 절대 불가합니다.

---

## 8. 코드 품질 및 최적화 규칙 (Advanced Quality)

- **🚫 매직 넘버(Magic Number) 지양**
  - 코드 내부에 의미를 알 수 없는 숫자 (예: `setTimeout(fn, 1000)` 또는 `if (status === 2)`)의 직접적인 사용을 엄격히 금지합니다.
  - 횟수, 딜레이 시간, 상태 코드 등의 값은 반드시 상단 혹은 독립 상수 파일에 의미 있는 이름(`const DEBOUNCE_DELAY_MS = 1000;`)으로 추출하여 사용합니다.

- **📦 Props 전달과 구조 분해 (Destructuring)**
  - 의도치 않은 DOM 속성 누수와 불필요한 리렌더링을 방지하기 위해 무지성 Prop Spreading (`<Child {...props} />`)을 극도로 지양합니다. Prop은 명시적으로 내려주는 것을 원칙으로 합니다.
  - 컴포넌트나 함수의 파라미터에서는 객체 전체를 받기보다 **구조 분해 할당(Destructuring)**을 진행하여, 시그니처만 보고도 어떤 값을 사용하는지 직관적으로 알 수 있게 합니다.

- **🎨 스타일 가독성 유지 (Tailwind CSS)**
  - 동적 조건부 스타일링 시 삼항 연산자와 템플릿 리터럴을 지저분하게 섞는 것을 금지합니다.
  - 클래스 스타일 충돌을 방지하고 가독성을 확보하기 위해, 프로젝트 내부에 존재하는 `cn()` 유틸리티 함수(기본적으로 `clsx` + `tailwind-merge`)를 적극적으로 사용하여 병합합니다.

- **⚡️ 비동기 병렬 처리 (Async/Await)**
  - `.then().catch()` 체이닝 방식 대신 가독성을 위해 `async / await` 구문을 통일하여 사용합니다.
  - 서로 의존성 없는 독립적인 여러 개의 API 통신이나 비동기 작업은 `await`를 직렬적으로 나열하지 않고, 반드시 **`Promise.all` 또는 `Promise.allSettled`**을 활용해 병렬 퍼포먼스를 최적화합니다.
