import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    saveQnAData,
    removeNoInfoQuestions,
    appendTrainData,
    reloadPrompt
} from '../utils/util.js';
import { chatSessions } from '../services/openai.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// GET /noinfo/:company → 질문 목록 반환
export const getNoInfoQuestions = (req, res) => {
    const { company } = req.params;
    const filePath = path.resolve('data/noInfoData', `${company}.inInfo.json`);

    try {
        if (!fs.existsSync(filePath)) return res.json([]);
        let data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        // 문자열 배열일 경우 자동 변환
        if (typeof data[0] === 'string') {
            data = data.map(q => ({ question: q, count: 1 }));
        }

        // count 기준 정렬
        data.sort((a, b) => b.count - a.count);
        res.json(data);
    } catch (err) {
        console.error('[GET noinfo] 실패:', err);
        res.status(500).json({ error: '질문 목록 불러오기 실패' });
    }
};

// POST /noinfo/:company → 답변된 질문 저장 + 학습 반영
export const submitNoInfoAnswers = (req, res) => {
    const { company } = req.params;
    const qaList = req.body; // [{ original, question, answer }]

    try {
        const filtered = qaList.filter(q => q.question && q.answer); // 유효한 항목만 추출
        const simplified = filtered.map(q => ({ question: q.question, answer: q.answer }));

        // 1. 질문-답변을 questions.json에 저장
        saveQnAData(simplified, company);

        // 2. prompt.json에 학습 메시지 추가
        const systemMsg = {
            role: 'system',
            content: JSON.stringify(simplified)
        };

        try {
            appendTrainData([systemMsg], company);
            reloadPrompt(company); // ✅ 최신 prompt 반영
        } catch (err) {
            console.error('[appendTrainData] 실패:', err);
            return res.status(500).json({ error: '프롬프트 저장 실패' });
        }

        // 3. noInfo에서 제거 (기존 질문)
        const questionsToRemove = filtered.map(q => q.original);
        removeNoInfoQuestions(questionsToRemove, company);

        // 4. 기존 세션 삭제 → 새로운 프롬프트 반영을 위해
        for (const chatid of chatSessions.keys()) {
            if (chatid.startsWith(`${company}:`)) {
                chatSessions.delete(chatid);
                console.log(`[chatSessions] '${chatid}' 세션 삭제됨`);
            }
        }

        res.json({ success: true, updated: filtered.length });
    } catch (err) {
        console.error('[POST noinfo] 실패:', err);
        res.status(500).json({ error: '질문 반영에 실패했습니다.' });
    }
};

// DELETE /noinfo/:company → 질문 삭제
export const deleteNoInfoQuestion = (req, res) => {
    const { company } = req.params;
    const { question } = req.body;

    if (!question) return res.status(400).json({ error: '삭제할 질문이 없습니다.' });

    try {
        removeNoInfoQuestions([question], company);
        res.json({ success: true });
    } catch (err) {
        console.error('[DELETE noinfo] 실패:', err);
        res.status(500).json({ error: '질문 삭제 실패' });
    }
};
