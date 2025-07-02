import path from 'path';
import {
    saveQnAData,
    saveTrainData,
    saveJsonToFile,
    parseJsonObject,
    sleep,
    appendTrainData,
    reloadPrompt
} from '../utils/util.js';
import { getPromptFromChatGPT, chatSessions } from '../services/openai.js';
import { reloadTrainData, generateChatResponse } from '../services/chatapi.js';
import fs from 'fs';

export const saveQna = async (req, res) => {
    const companyname = req.params.companyname;
    const qnalist = req.body;

    try {
        // 유효한 데이터만 필터링 (빈 질문/답변 제외)
        const filtered = qnalist.filter(q => q.question && q.answer);
        
        // QnA 데이터 저장
        saveQnAData(filtered, companyname);
        
        // prompt.json에 학습 메시지 추가
        const systemMsg = {
            role: 'system',
            content: JSON.stringify(filtered)
        };
        appendTrainData([systemMsg], companyname);
        
        // 프롬프트 즉시 리로드
        reloadPrompt(companyname);
        
        // 기존 채팅 세션 삭제 (새로운 프롬프트 적용을 위해)
        for (const chatid of chatSessions.keys()) {
            if (chatid.startsWith(`${companyname}:`)) {
                chatSessions.delete(chatid);
                console.log(`[chatSessions] '${chatid}' 세션 삭제됨`);
            }
        }

        res.json({ message: 'QnA 저장 및 학습 완료', data: filtered });
    } catch (err) {
        console.error('[saveQna] 오류:', err);
        res.status(500).json({ message: 'QnA 저장 실패' });
    }
};

export const handleRawData = async (req, res) => {
    const { companyname, rawdata, jsondata, rawraw } = req.body;
    let msg = { role: 'system', content: '' };
    let pJSONobj = {};

    try {
        if (jsondata) {
            msg.content = rawdata;
            pJSONobj.questions = JSON.parse(rawdata);
        } else if (rawraw) {
            msg.content = JSON.stringify([rawdata]);
            pJSONobj.questions = [];
        } else {
            const response = await getPromptFromChatGPT(rawdata);
            pJSONobj = parseJsonObject(response.content);
            msg.content = JSON.stringify(
                'content' in pJSONobj ? pJSONobj.content : pJSONobj
            );
            saveQnAData(pJSONobj.questions, companyname);
        }

        const promptmsg = {
            companyname,
            companyid: '5555',
            date: '20250421',
            author: '이상환',
            messages: [msg]
        };

        const filePath = path.join('data/trainData', `${companyname}.prompt.json`);
        saveTrainData(promptmsg, companyname);
        saveJsonToFile(promptmsg, filePath);

        await sleep(1000);
        reloadTrainData();

        res.json({
            content: JSON.parse(msg.content),
            questions: pJSONobj.questions,
        });
    } catch (err) {
        console.error('[handleRawData] 오류:', err);
        res.status(500).json({ message: 'rawdata 처리 실패' });
    }
};

export const handleQuery = async (req, res) => {
    const { chatid } = req.params;
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ message: '메시지를 입력해주세요.' });
    }

    try {
        const content = await generateChatResponse(chatid, message);
        res.json({ content });
    } catch (err) {
        console.error('[handleQuery] 오류:', err);
        res.status(500).json({ message: '챗봇 응답 처리 중 오류 발생' });
    }
};

export const handleFileUpload = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: '파일이 업로드되지 않았습니다.' });
    }

    try {
        reloadTrainData();
        res.status(200).json({ message: `${req.file.originalname} 업로드 및 학습 완료!` });
    } catch (err) {
        console.error('[handleFileUpload] 오류:', err);
        res.status(500).json({ message: '업로드 실패' });
    }
};

// 기존 QnA 조회 API
export const getQuestions = (req, res) => {
    const company = req.params.company;
    const filePath = path.resolve('data/questionData', `${company}.questions.json`);
    try {
        if (!fs.existsSync(filePath)) return res.json([]);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        res.json(data);
    } catch (err) {
        console.error('[getQuestions] 오류:', err);
        res.status(500).json({ message: 'QnA 조회 실패' });
    }
};

// 기존 QnA 수정 API
export const patchQuestions = (req, res) => {
    const company = req.params.company;
    const updates = req.body; // [{ original, question, answer }]
    const qnaPath = path.resolve('data/questionData', `${company}.questions.json`);
    const promptPath = path.resolve('data/trainData', `${company}.prompt.json`);
    try {
        let qnaList = fs.existsSync(qnaPath) ? JSON.parse(fs.readFileSync(qnaPath, 'utf-8')) : [];
        let promptObj = fs.existsSync(promptPath) ? JSON.parse(fs.readFileSync(promptPath, 'utf-8')) : { messages: [] };
        // QnA 수정
        updates.forEach(update => {
            // questions.json 수정
            const idx = qnaList.findIndex(q => q.question === update.original);
            if (idx !== -1) {
                qnaList[idx] = { question: update.question, answer: update.answer };
            }
            // prompt.json 수정 (system 메시지 내 QnA도 수정)
            if (promptObj.messages) {
                promptObj.messages = promptObj.messages.map(msg => {
                    if (msg.role === 'system') {
                        try {
                            let arr = JSON.parse(msg.content);
                            if (Array.isArray(arr)) {
                                arr = arr.map(q => q.question === update.original ? { question: update.question, answer: update.answer } : q);
                                msg.content = JSON.stringify(arr);
                            }
                        } catch {}
                    }
                    return msg;
                });
            }
        });
        fs.writeFileSync(qnaPath, JSON.stringify(qnaList, null, 2), 'utf-8');
        fs.writeFileSync(promptPath, JSON.stringify(promptObj, null, 2), 'utf-8');
        reloadPrompt(company);
        res.json({ message: 'QnA 수정 완료', data: qnaList });
    } catch (err) {
        console.error('[patchQuestions] 오류:', err);
        res.status(500).json({ message: 'QnA 수정 실패' });
    }
};

// 기존 QnA 삭제 API
export const deleteQuestion = (req, res) => {
    const company = req.params.company;
    const { question } = req.body;
    const qnaPath = path.resolve('data/questionData', `${company}.questions.json`);
    const promptPath = path.resolve('data/trainData', `${company}.prompt.json`);
    try {
        let qnaList = fs.existsSync(qnaPath) ? JSON.parse(fs.readFileSync(qnaPath, 'utf-8')) : [];
        let promptObj = fs.existsSync(promptPath) ? JSON.parse(fs.readFileSync(promptPath, 'utf-8')) : { messages: [] };
        // QnA 삭제
        qnaList = qnaList.filter(q => q.question !== question);
        if (promptObj.messages) {
            promptObj.messages = promptObj.messages.map(msg => {
                if (msg.role === 'system') {
                    try {
                        let arr = JSON.parse(msg.content);
                        if (Array.isArray(arr)) {
                            arr = arr.filter(q => q.question !== question);
                            msg.content = JSON.stringify(arr);
                        }
                    } catch {}
                }
                return msg;
            });
        }
        fs.writeFileSync(qnaPath, JSON.stringify(qnaList, null, 2), 'utf-8');
        fs.writeFileSync(promptPath, JSON.stringify(promptObj, null, 2), 'utf-8');
        reloadPrompt(company);
        res.json({ message: 'QnA 삭제 완료', data: qnaList });
    } catch (err) {
        console.error('[deleteQuestion] 오류:', err);
        res.status(500).json({ message: 'QnA 삭제 실패' });
    }
};