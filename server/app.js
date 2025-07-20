import express from 'express';
import cors from 'cors';
import log4js from 'log4js';
import path from 'path';
import { fileURLToPath } from 'url';
import router from './routes/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;

// Logger 설정
log4js.configure({
    appenders: { out: { type: 'stdout' } },
    categories: { default: { appenders: ['out'], level: 'info' } }
});
const logger = log4js.getLogger('app');

// 요청 로깅 (모든 요청에 대해 기록)
app.use((req, res, next) => {
    logger.info(`Request URL: ${req.method} ${req.originalUrl}`);
    next();
});

// 기본 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 🚀 위젯 스크립트 서빙
app.get('/widget.js', (req, res) => {
    const widgetPath = path.join(__dirname, '../widget/build/static/js/main.18832efe.js');
    res.sendFile(widgetPath);
});

// 기존 API 라우터 등록
app.use(router);

// 🚀 관리자 페이지 정적 파일 서빙
app.use('/admin', express.static(path.join(__dirname, '../admin/build')));

// 🚀 관리자 페이지 SPA 지원 (이 부분을 가장 마지막에 배치)
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin/build/index.html'));
});

// Health Check
app.get('/', (_, res) => res.sendStatus(200));

// 전역 에러 핸들러
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({ error: err.message });
});

// 서버 시작
app.listen(port, () => {
    logger.info(`🚀 Server started at http://localhost:${port}`);
    logger.info(`📊 Admin Page: http://localhost:${port}/admin`);
    logger.info(`🤖 Widget Script: http://localhost:${port}/widget.js`);
});
