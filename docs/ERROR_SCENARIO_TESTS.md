# Phase 5.3: 에러 시나리오 테스트 가이드

**작성일**: 2026-06-22  
**Phase**: 5.3 - 에러 처리 & 견고성 강화  
**목표**: 모든 예상 가능한 에러 상황을 테스트하고 올바른 에러 메시지 및 로깅 확인

---

## 🚀 테스트 환경 준비

### 1단계: 로컬 서버 시작

```bash
npm run dev
```

**예상 로그**:
```
[Notion API] ✅ 환경 변수 검증 완료
[Notion API] 포스트 목록 조회 시작...
```

### 2단계: 브라우저/콘솔 모니터링 준비

**터미널 2개 준비**:
- 터미널 1: `npm run dev` (로컬 서버 실행)
- 터미널 2: 테스트 명령어 실행 (curl 등)

**브라우저**:
- DevTools 열기: F12 → Console 탭
- 각 요청 후 콘솔 로그 확인

---

## 🧪 테스트 시나리오

### 테스트 1: API Key 누락 또는 유효하지 않음

#### 시나리오 1.1: NOTION_API_KEY 완전히 누락

**준비**:
```bash
# .env.local의 NOTION_API_KEY 줄을 주석 처리하거나 삭제
# NOTION_API_KEY=secret_xxxxx
```

**테스트**:
```bash
npm run dev
```

**예상 결과**:
```
[설정 오류] NOTION_API_KEY 환경 변수가 설정되지 않았습니다. .env.local에 NOTION_API_KEY=secret_xxxxx 형식으로 추가하세요.
```

**브라우저**:
- 홈 페이지 접속 시 에러 메시지 표시
- 또는 빈 포스트 목록 (에러 로깅됨)

**콘솔 확인**:
```
✅ 검증 항목:
- [ ] 에러 메시지 명확한가? (API Key 설정 방법 포함)
- [ ] 로그 레벨 적절한가? (console.error 사용)
- [ ] 개발자가 다음 단계를 알 수 있는가?
```

**복구**:
```bash
# .env.local에서 NOTION_API_KEY 복원
NOTION_API_KEY=secret_xxxxx
npm run dev
```

---

#### 시나리오 1.2: NOTION_API_KEY가 너무 짧음

**준비**:
```bash
# .env.local 수정
NOTION_API_KEY=short
```

**테스트**:
```bash
npm run dev
```

**예상 결과**:
```
[설정 오류] NOTION_API_KEY가 너무 짧습니다. 유효한 Notion API 토큰인지 확인하세요.
```

**복구**:
```bash
# 올바른 API Key로 복원
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

#### 시나리오 1.3: NOTION_API_KEY가 유효하지 않음 (잘못된 토큰)

**준비**:
```bash
# .env.local 수정
NOTION_API_KEY=secret_invalidtokenhere1234567890
```

**테스트**:
```bash
npm run dev
```

**예상 결과** (약 30초 후):
```
[Notion API] ❌ API 인증 오류 (HTTP 401)

❌ Notion API 인증 오류

해결 방법:
1. .env.local의 NOTION_API_KEY 값이 올바른지 확인하세요
2. 토큰이 만료되었다면 https://www.notion.so/my-integrations에서 재생성하세요
3. 로컬 서버를 재시작하세요
```

**콘솔 확인**:
```
✅ 검증 항목:
- [ ] 401 Unauthorized 에러 감지됨
- [ ] 에러 메시지에 해결 방법 포함
- [ ] API Key 재생성 링크 제시
```

**복구**:
```bash
# 올바른 API Key로 복원
NOTION_API_KEY=secret_[actual_valid_key]
npm run dev
```

---

### 테스트 2: Database ID 오류

#### 시나리오 2.1: NOTION_DATABASE_ID 누락

**준비**:
```bash
# .env.local의 NOTION_DATABASE_ID 줄 주석 처리
# NOTION_DATABASE_ID=abcdefghijklmnopqrstuvwxyz123456
```

**테스트**:
```bash
npm run dev
```

**예상 결과**:
```
[설정 오류] NOTION_DATABASE_ID 환경 변수가 설정되지 않았습니다. Notion Database URL에서 '?' 앞의 32자 ID를 추출해 설정하세요.
```

**복구**:
```bash
# DATABASE_ID 복원
NOTION_DATABASE_ID=abcdefghijklmnopqrstuvwxyz123456
```

---

#### 시나리오 2.2: NOTION_DATABASE_ID가 잘못됨

**준비**:
```bash
# .env.local 수정
NOTION_DATABASE_ID=0000000000000000000000000000000
```

**테스트**:
```bash
npm run dev
```

**예상 결과** (약 30초 후):
```
[Notion API] ❌ Notion Database를 찾을 수 없습니다 (HTTP 404)

❌ Notion Database를 찾을 수 없습니다

해결 방법:
1. .env.local의 NOTION_DATABASE_ID가 정확한지 확인하세요
2. Notion에서 해당 Database가 존재하는지 확인하세요
3. Database URL에서 ID를 복사해 다시 확인하세요
4. 올바른 값으로 수정 후 서버를 재시작하세요
```

**콘솔 확인**:
```
✅ 검증 항목:
- [ ] 404 Not Found 에러 감지됨
- [ ] Database ID 확인 방법 명확
- [ ] URL 예시 포함
```

**복구**:
```bash
# 올바른 DATABASE_ID로 복원
NOTION_DATABASE_ID=abcdefghijklmnopqrstuvwxyz123456
npm run dev
```

---

#### 시나리오 2.3: Integration이 Database와 공유되지 않음

**준비**:
```bash
# 유효한 API Key와 Database ID 사용
# 하지만 Notion에서 Integration을 Database와 공유하지 않은 상태
```

**테스트**:
```bash
npm run dev
```

**예상 결과** (약 30초 후):
```
[Notion API] ❌ Notion Database 접근 권한 오류 (HTTP 403)

❌ Notion Database 접근 권한 오류

해결 방법:
1. Notion에서 해당 Database를 엽니다
2. 우상단 공유 버튼 클릭
3. 'Invite'에서 'Blog CMS' Integration을 검색해 추가하세요
4. 로컬 서버를 재시작하세요
```

**콘솔 확인**:
```
✅ 검증 항목:
- [ ] 403 Forbidden 에러 감지됨
- [ ] Notion에서 공유 방법 단계별 설명
- [ ] Integration 이름 명확히 제시
```

**복구** (Notion에서):
1. 해당 Database 열기
2. 우상단 공유 버튼 클릭
3. "Blog CMS" Integration 검색 후 초대

---

### 테스트 3: Notion 서버 오류

#### 시나리오 3.1: Notion 서버 (5xx 에러)

**테스트**: Notion 상태 페이지에서 실제 서비스 중단 대기
- URL: https://status.notion.so

**예상 결과** (서버 오류 시):
```
[Notion API] ❌ Notion 서버 오류 (HTTP 500)

❌ Notion 서버 오류 (HTTP 500)

해결 방법:
- Notion 상태 페이지 확인: https://status.notion.so
- 몇 분 후 다시 시도하세요
```

**콘솔 확인**:
```
✅ 검증 항목:
- [ ] 5xx 에러 감지됨
- [ ] 상태 페이지 링크 제시
- [ ] 재시도 안내
```

---

### 테스트 4: Rate Limit (429)

#### 시나리오 4.1: 빠른 연속 요청으로 Rate Limit 트리거

**준비**:
```bash
# .env.local의 환경 변수 검증되어 있는 상태
# 로컬 서버 실행 중
```

**테스트**:
```bash
# 시뮬레이션: Node.js 스크립트로 빠른 요청 생성
node -e "
(async () => {
  const fetchPosts = () => fetch('http://localhost:3000/');
  for (let i = 0; i < 10; i++) {
    console.log(\`요청 \${i+1}\`);
    fetchPosts();
    await new Promise(r => setTimeout(r, 100));
  }
})();
"
```

**예상 결과** (일부 요청에서):
```
[Notion API] ⚠️ Rate Limit 초과. 1000ms 후 재시도...
[Notion API] ⚠️ Rate Limit 초과. 2000ms 후 재시도...
[Notion API] ⚠️ Rate Limit 초과. 4000ms 후 재시도...

또는

[Notion API] ❌ Notion API Rate Limit 초과

⚠️ Notion API Rate Limit 초과

해결 방법:
- 시스템이 자동으로 재시도합니다 (최대 3회)
- 계속 오류가 발생하면 몇 분 후 다시 시도하세요
- Notion API는 3req/sec 제한이 있습니다
```

**콘솔 확인**:
```
✅ 검증 항목:
- [ ] Exponential Backoff 로그 확인 (1s → 2s → 4s)
- [ ] 자동 재시도 작동
- [ ] 최대 3회 재시도 후 실패
- [ ] Rate Limit 설명 제시
```

---

### 테스트 5: Notion 포스트 검증 실패

#### 시나리오 5.1: 필드 누락 (제목 없음)

**준비** (Notion에서):
```
1. 테스트 포스트 생성
2. 제목(Title) 필드 비워두기
3. Published=true 설정
4. 서버에서 새로고침
```

**테스트**:
```bash
npm run dev
```

**예상 결과** (콘솔):
```
[Notion API] 포스트 파싱 오류 (필수 필드 누락): 포스트 ID: xxxxx, 
title: ✗, slug: ✓, publishedAt: ✓
```

**브라우저**:
- 해당 포스트가 목록에서 나타나지 않음 (필터링됨)
- 다른 포스트는 정상 표시

**콘솔 확인**:
```
✅ 검증 항목:
- [ ] 필드 검증 상세 로그
- [ ] 누락된 필드 시각적 표시 (✗)
- [ ] 포스트 ID 기록 (디버깅용)
- [ ] 에러 로그이지만 서버는 크래시하지 않음
```

---

#### 시나리오 5.2: Slug 중복

**준비** (Notion에서):
```
1. 기존 포스트 A: slug="test-post"
2. 새 포스트 B: slug="test-post" (중복!)
3. 둘 다 Published=true 설정
```

**테스트**:
```bash
npm run dev
```

**예상 결과**:
- 홈 페이지: 1개만 표시됨 (중복 제거 또는 먼저 로드된 것)
- 콘솔: 중복 경고 (선택적 구현)

**콘솔 확인**:
```
✅ 검증 항목:
- [ ] 중복된 slug 감지 시 경고 (선택적)
- [ ] 일관되게 1개만 표시됨 (또는 가장 최신)
```

---

#### 시나리오 5.3: Zod 스키마 검증 실패

**준비** (직접 코드 수정으로 시뮬레이션):
```typescript
// lib/notion.ts - 테스트용 수정
const post = {
  id: "invalid",
  slug: "", // 빈 slug
  title: "Test",
  publishedAt: "not-a-date", // 잘못된 날짜 형식
  tags: "not-an-array", // 배열이 아님
  // 나머지 필드 생략
};
```

**테스트**:
```bash
npm run dev
```

**예상 결과** (콘솔):
```
[Notion API] 포스트 검증 실패 (ID: invalid): 
필드 'slug': String must contain at least 1 character; 
필드 'publishedAt': Expected date, received string; 
필드 'tags': Expected array, received string
```

**콘솔 확인**:
```
✅ 검증 항목:
- [ ] 각 필드 검증 오류 상세 기록
- [ ] Zod 에러 메시지 명확
- [ ] 디버깅에 필요한 정보 완전
```

---

### 테스트 6: 포스트 조회 실패 시나리오

#### 시나리오 6.1: 존재하지 않는 slug 접근

**테스트**:
```bash
# 브라우저에서 접속
http://localhost:3000/posts/non-existent-slug
```

**예상 결과**:
- 404 페이지 표시
- 콘솔 로그:
```
[Notion API] 포스트 조회 시작: slug='non-existent-slug'
[Notion API] ⚠️ 포스트 미발견: slug='non-existent-slug' 
(가능한 원인: 잘못된 slug, 미게시 상태)
```

**콘솔 확인**:
```
✅ 검증 항목:
- [ ] 조회 시작 로그 있음
- [ ] 포스트 미발견 경고
- [ ] 가능한 원인 제시
- [ ] 404 페이지 렌더링됨
```

---

#### 시나리오 6.2: Published=false 포스트 직접 접근

**준비** (Notion에서):
```
1. 포스트 생성: slug="unpublished-test"
2. Published=false 설정
3. Vercel에 배포되었다면 적용됨
```

**테스트** (로컬):
```bash
# 포스트 DB 구조상 조회되지만, getPostBySlug에서 필터링됨
http://localhost:3000/posts/unpublished-test
```

**예상 결과**:
- 404 페이지 표시
- 콘솔 로그:
```
[Notion API] 포스트 조회 시작: slug='unpublished-test'
[Notion API] ⚠️ 포스트 미게시: slug='unpublished-test', 
title='Unpublished Test Post'
```

**콘솔 확인**:
```
✅ 검증 항목:
- [ ] 미게시 상태 감지
- [ ] 포스트 정보 로그에 포함 (디버깅용)
- [ ] 404 페이지 렌더링됨
```

---

### 테스트 7: 블록 조회 오류

#### 시나리오 7.1: 존재하지 않는 Page ID로 블록 조회

**준비**:
```typescript
// 직접 호출 테스트
import { getPostBlocks } from "@/lib/notion";

const result = await getPostBlocks("invalid-page-id");
```

**예상 결과**:
```
[Notion API] 블록 조회 시작: pageId='invalid-page-id'
[Notion API] ❌ 블록 조회 실패: pageId='invalid-page-id', 에러: ...
```

**콘솔 확인**:
```
✅ 검증 항목:
- [ ] 조회 시작 로그
- [ ] 오류 감지 및 로깅
- [ ] 에러 핸들링 (예외 발생)
```

---

## 📋 최종 테스트 체크리스트

### Phase 5.3 에러 처리 완료 검증

- [ ] **Task 1 완료**: API 에러 핸들링 강화
  - validateEnvironment 함수 작동 확인
  - 401, 403, 404, 429, 5xx 에러별 메시지 명확성
  - 각 에러에 대한 해결 방법 제시

- [ ] **Task 2 완료**: Zod 스키마 검증
  - NotionPostSchema import 확인
  - parsePost에서 검증 로직 작동
  - 검증 실패 시 상세 에러 로깅

- [ ] **Task 3 완료**: 포괄적인 로깅
  - getAllPosts에 시작/완료 로그
  - getPostBySlug에 조회/미발견 로그
  - getPostBlocks에 블록 타입별 통계
  - 모든 에러에 [Notion API] 프리픽스

- [ ] **Task 4 완료**: 에러 시나리오 테스트
  - 총 7개 시나리오 모두 테스트
  - 각 시나리오별 예상 결과 확인
  - 콘솔 로그 명확성 검증

---

## 🔗 참고 자료

- handleNotionError 함수: lib/notion.ts (라인 ~150)
- NotionPostSchema: types/notion.ts (라인 43-54)
- parsePost 함수: lib/notion.ts (라인 267-333)
- getPostBySlug 함수: lib/notion.ts (라인 466-502)
- getPostBlocks 함수: lib/notion.ts (라인 508-590)

---

**작성**: 2026-06-22  
**상태**: Phase 5.3 Task 4 완료 예정

