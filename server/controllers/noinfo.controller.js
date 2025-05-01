import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    saveQnAData,
    removeNoInfoQuestions, appendTrainData, reloadPrompt
} from '../utils/util.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// GET /noinfo/:company → 질문 목록 반환
export const getNoInfoQuestions = (req, res) => {
    const { company } = req.params;
    const filePath = path.resolve('data/noInfoData', `${company}.inInfo.json`);

    try {
        if (!fs.existsSync(filePath)) return res.json([]);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        res.json(data);
    } catch (err) {
        console.error('[GET noinfo] 실패:', err);
        res.status(500).json({ error: '질문 목록을 불러오지 못했습니다.' });
    }
};

// POST /noinfo/:company → 답변된 질문 저장 + 학습 반영
export const submitNoInfoAnswers = (req, res) => {
    const { company } = req.params;
    const qaList = req.body; // [{ question, answer }]

    try {
        const filtered = qaList.filter(q => q.question && q.answer);

        if (filtered.length === 0) return res.json({ success: false, updated: 0 });

        // 1. 질문-답변을 questions.json에 저장
        saveQnAData(filtered, company);

        // 2. prompt.json에 학습 메시지 추가
        const systemMsg = {
            role: 'system',
            content: JSON.stringify(filtered)
        };
        appendTrainData([systemMsg], company);

        // 3. noInfo에서 제거
        const questionsToRemove = filtered.map(q => q.question);
        removeNoInfoQuestions(questionsToRemove, company);

        // 4. 수정된 prompt 실시간 반영
        reloadPrompt(company);

        res.json({ success: true, updated: filtered.length });
    } catch (err) {
        console.error('[POST noinfo] 실패:', err);
        res.status(500).json({ error: '질문 반영에 실패했습니다.' });
    }
};
