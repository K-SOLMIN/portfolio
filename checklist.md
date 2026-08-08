# 포트폴리오 사이트 체크리스트

출처: Canva `portfolio.pptx` (DAHNfDbx2oc, 22p) — **내용만** 참고. 디자인은 새로 잡음.

## 1. 셋업
- [x] 칸바 디자인 텍스트 전량 추출
- [x] `C:\portfolio` 디렉토리 접근
- [x] checklist.md / context-notes.md 작성

## 2. 콘텐츠 정리
- [x] About / 연락처 / Skills 5개 카테고리
- [x] Education 2건 (구디아카데미 GDJ79, 한국소프트웨어진흥협회 KOSTA308)
- [x] 프로젝트 4건 (WAAIT, SBLIM, Trip_Helper, TheMoa)
- [x] 트러블슈팅 9건 케이스화 (WAAIT 3, Trip_Helper 3, TheMoa 3)
- [x] TheMoa 부가 섹션 (기술선택 3, 협업 3, 코딩 에이전트 규칙, 배포 4)
- [x] 덱 내 오타/불일치 목록화 → context-notes.md

## 3. 구현
- [x] `index.html` — 마크업 + 전체 콘텐츠
- [x] `styles.css` — 토큰, 레이아웃, 반응형
- [x] `script.js` — 스크롤 리빌, 섹션 추적, 스파인 라벨

## 4. 검증
- [x] 데스크톱 1440 / 태블릿 768 / 모바일 375 레이아웃 확인
- [x] 키보드 포커스 링 노출 확인
- [x] `prefers-reduced-motion` 존중 확인
- [x] 콘솔 에러 0건
- [x] 링크(GitHub, mailto, tel) 동작 확인

## 5. 이미지 (2차 작업)
- [x] `C:\project_output` 원본 27장 확인
- [x] 파일명이 모호한 12장은 직접 열어 캡션 확인
- [x] 리사이즈 + JPEG 변환해 `assets/` 에 복사 (19.7MB → 3.4MB, 24장)
- [x] 프로젝트별 갤러리 — WAAIT 1, Trip_Helper 10, TheMoa 13
- [x] 확대 보기(`<dialog>` 라이트박스) + `loading="lazy"` + `width`/`height` 지정
- [x] 375 / 1440 에서 깨진 이미지 0건, 가로 넘침 0px, 콘솔 에러 0건 확인

## 6. 남은 것 (사용자 확인 필요)
- [ ] `apricot-shoppingmall-project` 3장 — Canva 덱에 이 프로젝트 설명이 없어 **미반영**
- [ ] 날짜 불일치 4건 확정 (context-notes.md 참조)
- [ ] Trip_Helper GitHub URL 확정
