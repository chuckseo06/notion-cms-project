# ISR (Incremental Static Regeneration) 테스트 가이드

**작성일**: 2026-06-22  
**Phase**: 5.1 - ISR 최적화  
**목표**: 로컬 & 배포 환경에서 ISR 동작 검증

---

## 🚀 로컬 ISR 테스트

### 준비 작업

#### 1단계: REVALIDATE_SECRET 설정

`.env.local` 파일에 다음을 추가하세요:

```bash
# .env.local
NOTION_API_KEY=your_api_key
NOTION_DATABASE_ID=your_database_id
REVALIDATE_SECRET=your-secret-key-for-revalidation
```

**secret 만들기 팁**:
```bash
# 터미널에서 임의의 secret 생성
openssl rand -base64 32
# 예: "aBcDeFgHiJkLmNoPqRsTuVwXyZ123456=="
```

#### 2단계: 프로덕션 빌드 생성

```bash
npm run build
```

**예상 결과**:
```
✓ 홈 페이지 (app/page.tsx)
✓ 포스트 상세 페이지 (app/posts/[slug]/page.tsx)
✓ 404 페이지
✓ API 라우트

빌드 완료: X분 Y초
```

#### 3단계: 프로덕션 서버 시작

```bash
npm run start
```

**예상 로그**:
```
> next start
  ▲ Next.js 16.2.2
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000
```

---

### 📊 테스트 시나리오 1: 시간 기반 ISR (1시간 주기)

#### 테스트 환경
- 로컬: `http://localhost:3000`
- ISR 주기: 3600초 (1시간)
- 테스트 시간: ~3-5분 (단축 테스트는 별도 설정 필요)

#### 테스트 절차

**Step 1: 현재 상태 기록**
```
시간: 14:00:00
홈 페이지: 포스트 2개 표시
테스트 포스트 제목: "테스트 포스트 1"
```

**Step 2: Notion DB 데이터 변경**
- Notion 웹에서 테스트 포스트 제목 수정
  - 전: "테스트 포스트 1"
  - 후: "테스트 포스트 1 - 수정됨"
- PublishedAt 날짜 변경 (어제 → 오늘)

**Step 3: 로컬 서버에서 변경사항 확인 (즉시 NOT 반영)**
```bash
# localhost:3000 접속 후 새로고침
# 예상: "테스트 포스트 1" (아직 캐시된 이전 데이터)
```

**Step 4: 온디맨드 ISR API 호출 (즉시 재검증)**
```bash
# 새로운 터미널에서 실행
curl -X POST "http://localhost:3000/api/revalidate?secret=your-secret-key-for-revalidation"

# 예상 응답
{
  "revalidated": true,
  "timestamp": "2026-06-22T14:05:30.123Z",
  "message": "페이지가 성공적으로 재검증되었습니다."
}
```

**Step 5: 페이지 새로고침하여 변경사항 확인**
```bash
# localhost:3000 접속 후 새로고침 (Ctrl+Shift+R로 캐시 비우기)
# 예상: "테스트 포스트 1 - 수정됨" (변경사항 반영)
```

**Step 6: 포스트 상세 페이지도 확인**
```
localhost:3000/posts/test-post-1
→ 제목과 데이터가 모두 변경되어 있어야 함
```

#### ✅ 성공 기준
- [ ] Notion에서 데이터 변경
- [ ] 온디맨드 API 호출로 즉시 재검증
- [ ] 브라우저 새로고침 후 변경사항 반영
- [ ] 콘솔에 `[ISR API] ✅ 재검증 시작...` 로그 출력

---

### 📊 테스트 시나리오 2: 잘못된 secret (보안 테스트)

#### 테스트 절차

**Step 1: 잘못된 secret으로 API 호출**
```bash
curl -X POST "http://localhost:3000/api/revalidate?secret=wrong-secret"

# 예상 응답
{
  "revalidated": false,
  "message": "유효하지 않은 secret입니다."
}
# 상태 코드: 401
```

**Step 2: secret 없이 API 호출**
```bash
curl -X POST "http://localhost:3000/api/revalidate"

# 예상 응답
{
  "revalidated": false,
  "message": "유효하지 않은 secret입니다."
}
```

**Step 3: 로컬 서버 콘솔 확인**
```
[ISR API] ⚠️ 잘못된 secret으로 재검증 요청됨
```

#### ✅ 성공 기준
- [ ] 잘못된 secret은 401 에러 반환
- [ ] 데이터가 재검증되지 않음 (보안 유지)
- [ ] 콘솔에 경고 로그 출력

---

## 🌐 Vercel 배포 후 테스트 (Phase 5.4)

### 준비 작업

Vercel Dashboard → Project Settings → Environment Variables:
```
NOTION_API_KEY=your_api_key
NOTION_DATABASE_ID=your_database_id
REVALIDATE_SECRET=your-secret-key (배포 환경용 secret)
```

### 테스트 절차

**Step 1: 배포된 URL 기록**
```
https://your-project.vercel.app
```

**Step 2: Notion 데이터 변경**
- Notion에서 포스트 수정

**Step 3: 배포된 사이트에서 확인 (cache expire 전까지 반영 안 됨)**
```
# localhost:3000과 다르게, Vercel은 CDN 캐시를 사용
# 약 3600초(1시간) 동안 이전 버전 제공
```

**Step 4: 온디맨드 ISR API 호출로 즉시 업데이트**
```bash
curl -X POST "https://your-project.vercel.app/api/revalidate?secret=your-secret-key"

# 예상 응답
{
  "revalidated": true,
  "timestamp": "2026-06-22T14:30:00.000Z",
  "message": "페이지가 성공적으로 재검증되었습니다."
}
```

**Step 5: 배포된 사이트 새로고침**
```
https://your-project.vercel.app
→ Notion 변경사항이 즉시 반영됨
```

### ✅ 성공 기준
- [ ] Notion 데이터 변경
- [ ] 온디맨드 API 호출 성공
- [ ] 배포된 사이트에서 변경사항 반영
- [ ] Vercel Dashboard Logs에서 재검증 기록 확인

---

## 🐛 문제 해결 (Troubleshooting)

### 문제 1: revalidatePath가 작동 안 함

**증상**:
```
[ISR API] ✅ 재검증 시작...
하지만 페이지가 업데이트되지 않음
```

**해결**:
1. 브라우저 캐시 비우기 (Ctrl+Shift+Delete)
2. 페이지 하드 새로고침 (Ctrl+Shift+R)
3. `.next` 폴더 삭제 후 `npm run build` 다시 실행

### 문제 2: 401 Unauthorized 에러

**증상**:
```bash
curl -X POST "http://localhost:3000/api/revalidate?secret=..."
# 401 에러
```

**해결**:
1. `.env.local`의 `REVALIDATE_SECRET` 확인
2. curl 명령어의 secret과 정확히 일치하는지 확인
3. 공백이나 특수문자 확인
4. 로컬 서버 재시작 (`npm run start`)

### 문제 3: 로컬 빌드 실패

**증상**:
```
npm run build
# Build failed
```

**해결**:
```bash
# 1. 캐시 초기화
rm -rf .next node_modules

# 2. 의존성 재설치
npm install

# 3. 다시 빌드
npm run build
```

### 문제 4: API 엔드포인트 찾을 수 없음 (404)

**증상**:
```bash
curl -X POST "http://localhost:3000/api/revalidate?secret=..."
# 404 Not Found
```

**해결**:
1. 파일이 `app/api/revalidate/route.ts`에 있는지 확인
2. 파일명과 디렉토리 이름 정확성 확인
3. `npm run start`로 다시 시작

---

## 📋 체크리스트

### Phase 5.1 완료 검증

- [ ] **Task 1 완료**: revalidate = 3600 설정 확인
  - app/page.tsx ✓
  - app/posts/[slug]/page.tsx ✓

- [ ] **Task 2 완료**: 온디맨드 ISR API 구현
  - app/api/revalidate/route.ts 생성 ✓
  - secret 검증 로직 포함 ✓
  - revalidatePath 호출 구현 ✓

- [ ] **Task 3 완료**: ISR 동작 테스트
  - 로컬 테스트 (시간 기반 ISR): ✓
  - 로컬 테스트 (온디맨드 ISR): ✓
  - 보안 테스트 (잘못된 secret): ✓
  - Vercel 배포 후 테스트 (Phase 5.4): ⏳ 예정

---

## 🔗 참고 자료

- [Next.js ISR 공식 문서](https://nextjs.org/docs/app/building-your-application/data-fetching/revalidating)
- [Next.js revalidatePath API](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)
- [Vercel On-Demand ISR](https://vercel.com/docs/incremental-static-regeneration)

---

**작성**: 2026-06-22  
**상태**: Phase 5.1 실행 중
