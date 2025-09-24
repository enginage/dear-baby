# Dear Baby - 아이들의 경험 공유 커뮤니티

Reddit 스타일의 커뮤니티 게시판으로, 아이들의 경험을 공유할 수 있는 따뜻한 공간입니다.

## 🚀 기술 스택

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

## ✨ 주요 기능

- 🔐 **인증 시스템**: 회원가입, 로그인, 로그아웃
- 📝 **게시글 관리**: 글쓰기, 수정, 삭제, 조회
- 💬 **댓글 시스템**: 댓글 작성, 삭제
- 👍 **상호작용**: 좋아요, 싫어요 기능
- 🔍 **검색 기능**: 제목과 내용 기반 검색
- 👤 **프로필 페이지**: 사용자 정보 및 작성 글 관리

## 🛠️ 설치 및 실행

### 1. 프로젝트 클론 및 의존성 설치

```bash
git clone <repository-url>
cd dear-baby
npm install
```

### 2. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. `supabase-schema.sql` 파일의 내용을 Supabase SQL 에디터에서 실행
3. 프로젝트 설정에서 API URL과 Anon Key 복사

### 3. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📁 프로젝트 구조

```
dear-baby/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API 라우트
│   │   ├── auth/              # 인증 페이지
│   │   ├── posts/             # 게시글 페이지
│   │   ├── profile/           # 프로필 페이지
│   │   ├── layout.tsx         # 루트 레이아웃
│   │   └── page.tsx           # 홈페이지
│   ├── components/            # 재사용 가능한 컴포넌트
│   │   ├── Header.tsx         # 헤더 컴포넌트
│   │   ├── PostCard.tsx       # 게시글 카드
│   │   ├── PostForm.tsx       # 게시글 작성 폼
│   │   └── Comment.tsx        # 댓글 컴포넌트
│   ├── contexts/              # React 컨텍스트
│   │   └── AuthContext.tsx    # 인증 컨텍스트
│   ├── lib/                   # 유틸리티 함수
│   │   └── supabase.ts        # Supabase 클라이언트
│   └── types/                 # TypeScript 타입 정의
│       └── index.ts
├── supabase-schema.sql        # 데이터베이스 스키마
└── README.md
```

## 🎨 UI/UX 특징

- **Reddit 스타일 디자인**: 익숙한 커뮤니티 인터페이스
- **반응형 레이아웃**: 모바일과 데스크톱 모두 지원
- **직관적인 네비게이션**: 쉬운 사용자 경험
- **실시간 상호작용**: 좋아요/싫어요 즉시 반영

## 🔧 API 엔드포인트

### 게시글
- `GET /api/posts` - 게시글 목록 조회
- `POST /api/posts` - 게시글 작성
- `GET /api/posts/[id]` - 게시글 상세 조회
- `PUT /api/posts/[id]` - 게시글 수정
- `DELETE /api/posts/[id]` - 게시글 삭제

### 댓글
- `GET /api/posts/[id]/comments` - 댓글 목록 조회
- `POST /api/posts/[id]/comments` - 댓글 작성

### 좋아요/싫어요
- `POST /api/posts/[id]/like` - 좋아요 추가
- `DELETE /api/posts/[id]/like` - 좋아요 취소
- `POST /api/posts/[id]/dislike` - 싫어요 추가
- `DELETE /api/posts/[id]/dislike` - 싫어요 취소

## 🚀 배포

### Vercel 배포

1. GitHub에 코드 푸시
2. [Vercel](https://vercel.com)에서 프로젝트 연결
3. 환경 변수 설정
4. 자동 배포 완료

### 환경 변수 설정 (배포 시)

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.

---

Made with ❤️ for children's community