import OpenAI from 'openai';
import dotenv from 'dotenv';
import {promptCache, reloadPrompt, sleep} from '../utils/util.js';
import * as instructions from '../utils/instructions.js';
import { parseLLMMsg } from './specialaction.js';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const chatSessions = new Map();

export async function getCompletionChatGPT(trainData, chatid, prompt) {
    try {
        const [companyname] = chatid.split(':');

        if (!chatSessions.has(chatid)) {
            if (!promptCache[companyname]) {
                reloadPrompt(companyname);
            }
            // 최신 캐시가 있으면 최근 갱신된 prompt를, 없으면 초기 trainData 사용
            const companyPrompt = promptCache[companyname] || trainData[companyname];
            let messages = [...(companyPrompt?.messages || [])];

            messages.push({ role: 'system', content: instructions.reservationInstruction() });
            messages.push({ role: 'system', content: instructions.cancelInstruction() });
            messages.push({ role: 'system', content: instructions.scopeInstruction() });
            chatSessions.set(chatid, messages);
        }

        const messages = chatSessions.get(chatid);
        messages.push({ role: 'user', content: prompt });

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            store: true,
            messages,
        });

        const responseMessage = completion.choices?.[0]?.message || { content: '응답 없음' };
        messages.push(responseMessage);
        chatSessions.set(chatid, messages);

        return parseLLMMsg(responseMessage, messages, companyname);
    } catch (error) {
        console.error('[OpenAI] Error:', error);
        return { content: 'OpenAI 처리 실패' };
    }
}

export async function getPromptFromChatGPT(rawdata) {
    try {
        const requestmsg = instructions.rawdataInstruction(rawdata);
        const messages = [{ role: 'user', content: requestmsg }];

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            store: true,
            messages,
        });

        return completion.choices?.[0]?.message || { content: '응답 없음' };
    } catch (error) {
        console.error('[OpenAI:Prompt] Error:', error);
        return { content: '프롬프트 생성 실패' };
    }
}