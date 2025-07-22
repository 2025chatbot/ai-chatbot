#  AI Chatbot System
> m2cloud 산학프로젝트

## 📖 프로젝트 소개

이 프로젝트는 **병원 및 기업 웹사이트에 쉽게 임베딩할 수 있는 AI 챗봇 위젯**을 제공합니다. 관리자는 웹 인터페이스에서 질문/답변 데이터를 관리하고, 고객은 실제 웹사이트에서 플로팅 챗봇을 통해 즉시 상담받을 수 있습니다.

### ✨ 주요 특징

- 🎯 **플러그인 방식**: 단 한 줄의 스크립트로 어떤 웹사이트든 챗봇 추가
- 🛡️ **CSS 격리**: 호스트 웹사이트 스타일과 충돌 없는 독립적 디자인
- 🔧 **실시간 관리**: 웹 인터페이스에서 질문/답변 데이터 실시간 수정
- 🌐 **다중 도메인**: 여러 회사/병원별 독립적인 챗봇 관리

---

## ⚙️ 개발 환경 설정

### 📋 시스템 요구사항

- Node.js 18+
- npm 8+
- OpenAI API 키

### 1. 저장소 클론
```bash
git clone https://github.com/2025chatbot/ai-chatbot.git
cd ai-chatbot
```

### 2. 의존성 설치
```bash
# 관리자 페이지
cd admin
npm install

# 챗봇 위젯
cd ../widget
npm install

# 백엔드 서버
cd ../server
npm install
```

### 3. 환경 변수 설정

`server/.env` 파일을 생성하고 다음 내용을 입력하세요:

```env
# OpenAI API 설정
OPENAI_API_KEY=your_openai_api_key_here

# 챗봇 모델 설정
CHATAPI_MODEL=chatgpt
CHATAPI_URL=http://localhost:5000
```

### 4. 프로젝트 빌드

```bash
# 관리자 페이지 빌드
cd admin
npm run build

# 챗봇 위젯 빌드
cd ../widget
npm run build
```

### 5. 서버 실행

```bash
cd server
node app.js
```

🎉 **서버가 실행되었습니다!**
- 관리자 페이지: http://localhost:3000/admin
- API 서버: http://localhost:3000/api
- 위젯 로더: http://localhost:3000/widget-loader.js

---

## 📁 프로젝트 구조

```
ai-chatbot/
├── README.md
├── admin/                       # 관리자 웹 인터페이스
│   ├── package.json             # 관리자 페이지 의존성 관리
│   ├── public/                  # 정적 리소스
│   ├── src/
│   │   ├── App.js               # React Router 설정
│   │   ├── components/
│   │   │   └── Chat.js          # 관리자용 테스트 챗봇
│   │   └── pages/               # 주요 화면 구성
│   │   ├── Home.js              # 대시보드 홈
│   │   ├── CreateCompany.js     # 새 회사 등록 페이지
│   │   ├── CompanyList.js       # 회사 목록 관리
│   │   ├── AddQna.js            # Q&A 데이터 추가 입력
│   │   └── NoInfo.js            # 미학습 질문 관리
│   └── build/                   # 빌드된 정적 파일
│
├── widget/                      # 임베딩용 챗봇 위젯
│   ├── package.json             # 위젯 의존성 관리
│   ├── src/
│   │   ├── index.js             # 위젯 진입점
│   │   └── components/
│   │   └── ChatWidget.js        # 플로팅 챗봇 컴포넌트
│   └── build/                   # 빌드된 위젯 파일
│
└── server/                      # Express API 서버
│   ├── app.js                   # 서버 메인 (정적 파일 + API)
│   ├── package.json             # 서버 의존성 관리
│   ├── data/                    # 회사별 데이터 저장소
│   │   ├── trainData/           # AI 학습용 프롬프트
│   │   │   ├── apple.prompt.json
│   │   │   └── banana.prompt.json
│   │   ├── questionData/        # Q&A 데이터베이스
│   │   │   ├── apple.questions.json
│   │   │   └── banana.questions.json
│   │   └── noInfoData/          # 미학습 질문 수집
│   │   └── banana.inInfo.json
│   ├── routes/                  # API 라우터 정의
│   │   ├── index.js
│   │   ├── company.route.js     # 회사 관리 API
│   │   ├── qna.route.js         # 챗봇 대화 API
│   │   └── noinfo.route.js      # 미학습 데이터 API
│   ├── controllers/             # 라우터 핸들러
│   │   ├── company.controller.js
│   │   ├── qna.controller.js
│   │   └── noinfo.controller.js
│   ├── services/                # 외부 서비스 연동
│   │   ├── chatapi.js           # AI 모델 통합 관리
│   │   ├── openai.js            # OpenAI API 연동
│   │   └── specialaction.js     # 특수 액션 처리
│   └── utils/                   # 유틸리티 함수 모음
│       ├── util.js              # 파일 I/O 유틸리티
│       ├── traindata.js         # 학습 데이터 처리
│       └── instructions.js      # AI 프롬프트 생성
```

---

## ✅ 현재까지 구현된 기능

### 📌 관리자 웹 인터페이스 (React)
- **`/admin`** 홈 대시보드 (병원 관리 메뉴)
- **`/admin/create`** 새 병원 등록
  - 직접 입력: 병원명과 질문/답변 수동 입력
  - 파일 업로드: TXT/JSON 형식 파일로 일괄 등록
- **`/admin/companies`** 등록된 병원 목록 조회 및 관리
- **`/admin/company/:companyname`** 병원별 챗봇 테스트 페이지
- **`/admin/addqna/:name`** 기존 병원에 Q&A 데이터 추가
  - 직접 입력
  - 파일 업로드 (TXT / JSON)
- **`/admin/noinfo/:company`** 미학습 질문 관리
  - 신규 Q&A 탭: 답변 대기 중인 질문들
  - 기존 Q&A 탭: 학습된 질문 / 답변 수정

### 📌 챗봇 위젯 (React)
- **플로팅 위젯**: 웹사이트 우하단 플로팅 버튼
- **대화창**: 모달 형태의 실시간 채팅 인터페이스
- **CSS 격리**: 호스트 웹사이트와 스타일 충돌 방지

### 📌 백엔드 API 서버 (Express)

#### 🏥 회사 관리 API
- `POST /company` 새 병원 등록 → 자동 ID 생성 + 데이터 저장
- `GET /companies` 전체 병원 목록 조회

#### 💬 챗봇 대화 API  
- `POST /Query/:chatid` GPT 응답 처리 → 세션별 대화 관리
- `POST /addqna/:companyname` 추가 질문/답변 저장 → 즉시 학습 반영
- `POST /rawdata` 자연어 텍스트를 구조화된 JSON으로 변환
- `GET /questions/:company` 기존 질문/답변 목록 조회
- `PATCH /questions/:company` 기존 질문/답변 수정
- `DELETE /questions/:company` 질문/답변 삭제

#### 📝 미학습 데이터 API
- `GET /noinfo/:company` 답변 대기 질문 목록 조회
- `POST /noinfo/:company` 신규 질문에 대한 답변 등록
- `DELETE /noinfo/:company` 미학습 질문 삭제

#### 📁 파일 관리 API
- `POST /upload` JSON 파일 업로드 (학습 데이터 일괄 등록)

### 📌 AI 모델
- **OpenAI GPT** 연동
- **세션 관리**: 회사별 독립적인 대화 컨텍스트 유지
- **프롬프트 핫 리로드**: Q&A 추가 시 즉시 학습 반영

### 📌 데이터 관리 시스템
- **회사별 데이터 분리**: `data/{trainData|questionData|noInfoData}/`
- **실시간 파일 동기화**: 웹에서 수정 → JSON 파일 즉시 업데이트
- **학습 데이터 자동 생성**: Q&A 입력 → prompt.json 자동 생성
- **미학습 질문 수집**: 답변 불가능한 질문 자동 로깅

---

## 🧪 테스트 및 데모

### 방법 1: 테스트 HTML 파일로 빠른 확인

프로젝트 루트에 `test.html` 파일을 생성하여 챗봇을 테스트할 수 있습니다:

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI 챗봇 테스트</title>
    <style>
        body {
            font-family: 'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', 'Segoe UI', sans-serif;
            margin: 40px;
            line-height: 1.6;
        }
        .demo-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <h1>🏥 AI 챗봇 데모 페이지</h1>
    
    <div class="demo-section">
        <h2>병원 웹사이트 시뮬레이션</h2>
        <p>이 페이지는 실제 병원 웹사이트를 시뮬레이션합니다.</p>
        <p>우측 하단의 💬 버튼을 클릭하여 챗봇과 대화해보세요!</p>
    </div>

    <!-- 📝 챗봇 위젯 로드 -->
    <script src="http://localhost:3000/widget-loader.js"></script>
    <script>
        // 🚀 챗봇 초기화 (서버 실행 후)
        window.addEventListener('load', () => {
            if (window.initChatbot) {
                window.initChatbot({
                    companyName: 'apple',  // 등록된 병원명으로 변경
                    title: '애플 병원 상담',
                    serverUrl: 'http://localhost:3000'
                });
                console.log('✅ 챗봇 위젯이 성공적으로 로드되었습니다!');
            } else {
                console.error('❌ 챗봇 로더를 찾을 수 없습니다. 서버가 실행 중인지 확인하세요.');
            }
        });
    </script>
</body>
</html>
```

**실행 방법:**
1. 서버가 실행 중인지 확인: `http://localhost:3000/admin`  << 관리자 페이지 접속
2. `test.html` 파일을 브라우저에서 열기
3. 우측 하단 챗봇 버튼 클릭하여 테스트

### 방법 2: 브라우저 콘솔에서 동적 테스트

기존 웹사이트에서 **개발자 도구 → Console**을 열고 다음 코드를 실행:

```javascript
// 🔥 챗봇 위젯을 즉시 추가
const script = document.createElement('script');
script.src = 'http://localhost:3000/widget-loader.js';
document.head.appendChild(script);

setTimeout(() => {
  if (typeof initChatbot === 'function') {
    initChatbot({
      companyName: 'apple',
      title: '애플 병원 상담',
      serverUrl: 'http://localhost:3000'
    });
    console.log('✅ 실제 웹사이트에서 챗봇 로드 성공!');
  }
}, 2000);
```

**📋 요구사항:**
- 서버에 HTTPS 적용 필요
- Chrome 브라우저 사용 권장

**✨ 콘솔 테스트의 장점:**
- 기존 웹사이트 수정 없이 즉시 테스트
- 다양한 사이트에서 호환성 확인  
- CSS 충돌 여부 실시간 검증

**🔧 설정 옵션:**
- `companyName`: 관리자에서 등록한 병원명
- `title`: 챗봇 상단에 표시될 제목
- `serverUrl`: API 서버 주소 (배포 시 실제 도메인)

---
