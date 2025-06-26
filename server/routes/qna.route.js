import express from 'express';
import {
    saveQna,
    getQnaList
    // 필요 시 아래 핸들러들을 다시 활성화할 수 있음
    // handleRawData,
    // handleQuery,
    // handleFileUpload
} from '../controllers/qna.controller.js';

import multer from 'multer';
import path from 'path';

const router = express.Router();

// 파일 업로드 설정 (현재 미사용, 주석 처리 가능)
const uploadFolder = path.resolve('data/trainData');
const storage = multer.diskStorage({
    destination: (_, __, cb) => cb(null, uploadFolder),
    filename: (_, file, cb) => cb(null, file.originalname)
});
const upload = multer({
    storage,
    fileFilter: (_, file, cb) =>
        file.mimetype === 'application/json' ? cb(null, true) : cb(new Error('Only JSON'), false),
    limits: { fileSize: 2 * 1024 * 1024 }
});

// 현재 사용하는 라우트만 유지
router.get('/qna/:companyname', getQnaList);
router.post('/addqna/:companyname', saveQna);

// 아래는 모두 비활성화 처리 (원하면 다시 열 수 있음)
// router.post('/rawdata', handleRawData);
// router.post('/Query/:chatid', handleQuery);
// router.post('/upload', upload.single('file'), handleFileUpload);

export default router;
