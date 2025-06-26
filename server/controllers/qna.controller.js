import fs from 'fs';
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


// ✅ QnA + manualText 저장
export const saveQna = async (req, res) => {
    const companyname = req.params.companyname;
    const { qnalist, manualText } = req.body;

    try {
        const filtered = qnalist.filter(q => q.question && q.answer);
        saveQnAData(filtered, companyname);

        const systemMsg = {
            role: 'system',
            content: JSON.stringify(filtered)
        };
        appendTrainData([systemMsg], companyname);

        // ⬇ manualText 저장
        if (manualText && manualText.trim()) {
            const manualPrompt = {
                companyname,
                companyid: 'manual',
                date: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
                author: 'manual',
                messages: [
                    {
                        role: 'system',
                        content: manualText
                    }
                ]
            };
            const filePath = path.join('data/trainData', `${companyname}.manual.prompt.json`);
            saveJsonToFile(manualPrompt, filePath);
        }

        reloadPrompt(companyname);

        for (const chatid of chatSessions.keys()) {
            if (chatid.startsWith(`${companyname}:`)) {
                chatSessions.delete(chatid);
                console.log(`[chatSessions] '${chatid}' 세션 삭제됨`);
            }
        }

        res.json({ message: 'QnA 및 매뉴얼 저장 완료', data: filtered });
    } catch (err) {
        console.error('[saveQna] 오류:', err);
        res.status(500).json({ message: 'QnA 저장 실패' });
    }
};


// ✅ 기존 QnA 목록 불러오기
export const getQnaList = async (req, res) => {
    const companyname = req.params.companyname;
    const filePath = path.join('data/questionData', `${companyname}.questions.json`);

    try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const json = JSON.parse(raw);
        res.json({ qnaList: json });
    } catch (err) {
        console.error('[getQnaList] 오류:', err);
        res.status(500).json({ message: 'QnA 불러오기 실패' });
    }
};


// ✅ rawdata 처리 (AI 변환용)
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


// ✅ 챗봇 쿼리
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


// ✅ JSON 파일 업로드 시 즉시 학습
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
