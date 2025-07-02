import express from 'express';
import {
    saveQna,
    handleRawData,
    handleQuery,
    handleFileUpload,
    getQuestions,
    patchQuestions,
    deleteQuestion
} from '../controllers/qna.controller.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// 파일 업로드 설정
const uploadFolder = path.resolve('data/trainData');
const storage = multer.diskStorage({
    destination: (_, __, cb) => cb(null, uploadFolder),
    filename: (_, file, cb) => cb(null, file.originalname)
});
const fileFilter = (_, file, cb) => {
    file.mimetype === 'application/json'
        ? cb(null, true)
        : cb(new Error('Only JSON files allowed'), false);
};
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }
});

// 라우트 등록
router.post('/addqna/:companyname', saveQna);
router.post('/rawdata', handleRawData);
router.post('/Query/:chatid', handleQuery);
router.post('/upload', upload.single('file'), handleFileUpload);
router.get('/questions/:company', getQuestions);
router.patch('/questions/:company', patchQuestions);
router.delete('/questions/:company', deleteQuestion);

export default router;
