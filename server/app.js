import express from 'express';
import cors from 'cors';
import log4js from 'log4js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
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

// 요청 로깅
app.use((req, res, next) => {
    logger.info(`Request URL: ${req.method} ${req.originalUrl}`);
    next();
});

// CORS 및 Parser 설정
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 🚀 위젯 관련 설정
const widgetBuildPath = path.join(__dirname, '../widget/build');
app.use('/widget-static', express.static(widgetBuildPath));

app.get('/widget-loader.js', async (req, res) => {
    try {
        const manifestPath = path.join(widgetBuildPath, 'asset-manifest.json');
        const manifestData = await fs.readFile(manifestPath, 'utf-8');
        const manifest = JSON.parse(manifestData);

        const mainJs = manifest.files['main.js'];
        const mainCss = manifest.files['main.css'];
        const baseUrl = process.env.BASE_URL || `https://${req.get('host')}`;

        const loaderScript = `
(function() {
    console.log('Widget loader executed.');
    const widgetBaseUrl = '${baseUrl}/widget-static';

    ${mainCss ? `
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = \`\${widgetBaseUrl}${mainCss}\`;
    document.head.appendChild(link);
    console.log('CSS injected:', link.href);
    ` : ''}

    ${mainJs ? `
    const script = document.createElement('script');
    script.defer = true;
    script.src = \`\${widgetBaseUrl}${mainJs}\`;
    document.body.appendChild(script);
    console.log('Script injected:', script.src);
    ` : ''}
})();
        `;

        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');
        res.send(loaderScript);

    } catch (error) {
        logger.error('Widget loader error:', error);
        res.status(500).send('// Widget failed to load.');
    }
});

// API 라우터 및 관리자 페이지
app.use(router);
app.use('/admin', express.static(path.join(__dirname, '../admin/build')));
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin/build/index.html'));
});

// Health Check
app.get('/', (_, res) => res.sendStatus(200));

// 에러 핸들러
app.use((err, req, res, next) => {
    logger.error('Unhandled Error:', err);
    res.status(500).json({ error: err.message });
});

// 서버 시작
app.listen(port, () => {
    logger.info(`🚀 Server started at http://localhost:${port}`);
    logger.info(`📊 Admin Page: http://localhost:${port}/admin`);
    logger.info(`🤖 Widget Loader Script: http://localhost:${port}/widget-loader.js`);
});

