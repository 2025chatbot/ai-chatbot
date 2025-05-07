import path from 'path';
import {
    saveQnAData,
    saveTrainData,
    saveJsonToFile,
    parseJsonObject,
    appendQnAData,
    sleep,
    appendTrainData,
    reloadPrompt
} from '../utils/util.js';
import { getPromptFromChatGPT, chatSessions } from '../services/openai.js';
import { reloadTrainData, generateChatResponse } from '../services/chatapi.js';

export const saveQna = async (req, res) => {
    const companyname = req.params.companyname;
    const qnalist = req.body;

    try {
        // 유효한 데이터만 필터링 (빈 질문/답변 제외)
        const filtered = qnalist.filter(q => q.question && q.answer);
        
        // QnA 데이터 저장
        appendQnAData(filtered, companyname);
        
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