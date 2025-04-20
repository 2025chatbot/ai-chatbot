# m2cloud 산학프로젝트 (ai-chatbot)

## ⚙️ 개발 환경 설정

### 1. 저장소 클론
```bash
git clone [레포주소]
cd ai-chatbot
```

### 2. 의존성 설치
```bash
# 프론트엔드
cd client
npm install

# 백엔드
cd ../server
npm install
```

### 3. 환경 변수 파일 작성 (`server/.env`)
```
OPENAI_API_KEY=교수님이 주신 파일에 있습니다.
CHATAPI_MODEL=chatgpt
CHATAPI_URL=http://localhost:5000
```

### 4. 서버 실행
```bash
cd server
node app.js
```

### 5. 클라이언트 실행
```bash
cd client
npm start
```

➡️ Express API: http://localhost:3000   
➡️ React 앱: http://localhost:3001




## 📁 디렉토리 구조

```
ai-chatbot/
├── README.md
├── client/                         # React 프론트엔드 애플리케이션
│   ├── package.json               # 프론트 의존성 관리
│   ├── package-lock.json
│   ├── public/                    # CRA 정적 리소스 (favicon, manifest 등)
│   └── src/
│       ├── App.js                # SPA 라우팅 정의
│       ├── index.js             # React 진입점
│       ├── components/
│       │   └── Chat.js          # 채팅 위젯 컴포넌트
│       ├── pages/               # 주요 화면 구성
│       │   ├── Home.js
│       │   ├── CreateCompany.js  # 병원 등록 페이지
│       │   ├── CompanyList.js    # 등록된 병원 목록
│       │   ├── Company.js        # 병원 상세 + 채팅 위젯
│       │   ├── AddQna.js         # 질문/답변 추가 입력
│       │   ├── NoInfo.js         # 학습되지 않은 질문 대응
│       │   └── Admin.js
│       └── index.css, App.css, logo.svg 등
│
├── server/                         # Express 백엔드 API 서버
│   ├── app.js                    # 서버 진입점
│   ├── package.json             # 서버 의존성 관리
│   ├── package-lock.json
│   ├── start.sh                 # 서버 실행용 스크립트(삭제될 가능성 있음)
│   ├── public/                  # 정적 리소스 (qa_data.json 등)
│   ├── logs/                    # 로그 저장 디렉토리
│   ├── data/                    # 병원별 데이터 저장소
│   │   ├── trainData/           # 각 병원의 학습용 prompt JSON
│   │   │   ├── apple.prompt.json
│   │   │   └── banana.prompt.json
│   │   ├── questionData/        # 질문/답변 페어 모음
│   │   │   ├── apple.questions.json
│   │   │   └── banana.questions.json
│   │   └── noInfoData/          # 학습되지 않은 질문 보관
│   │       └── banana.inInfo.json
│   ├── routes/                  # API 라우터 정의
│   │   ├── index.js
│   │   ├── company.route.js     # 병원 생성, 목록 조회
│   │   └── qna.route.js         # 질문 처리, GPT 응답 등
│   ├── controllers/             # 라우터 핸들러
│   │   ├── company.controller.js
│   │   └── qna.controller.js
│   ├── services/                # GPT 서비스 통합
│   │   ├── chatapi.js           # 모델 선택 분기 + 메시지 흐름 관리
│   │   ├── openai.js            # OpenAI 기반 응답 처리
│   │   ├── ollama.js            # Ollama 기반 응답 처리
│   │   └── specialaction.js     # 예약/취소 등 특수 파싱 처리
│   └── utils/                   # 유틸리티 함수 모음
│       ├── util.js              # JSON 파일 저장/읽기/가공 등
│       ├── traindata.js         # 학습 데이터 초기화 로딩
│       └── instructions.js      # system 프롬프트 작성 함수
```

---

## ✅ 현재까지 구현된 기능

### 📌 프론트엔드 (React)
- `/` 홈 화면 (병원 생성/조회 메뉴)
- `/create`: 병원 이름과 질문/답변을 입력하여 등록
- `/companies`: 등록된 병원 목록 조회
- `/company/:name`: 해당 병원 채팅 위젯 표시
- `/noinfo/:name`: 정보 없는 질문 학습용 입력
- `/addqna`: QnA 직접 추가 (질문/답변 쌍)

### 📌 백엔드 (Express)
- `POST /company`: 병원 생성 → prompt + question JSON 저장
- `GET /companies`: 전체 병원 목록 조회
- `POST /Query/:chatid`: GPT 응답 요청 처리
- `POST /addqna/:name`: 추가 질문/답변 입력
- `POST /rawdata`: 자연어 → 구조화 JSON
- 모델 분기 처리 (Ollama / OpenAI) → `.env` 설정 기반


