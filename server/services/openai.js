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

        const hasSession = chatSessions.has(chatid);
        const hasPromptCache = promptCache[companyname];

        // 1. 프롬프트가 갱신되어 있지만 세션이 살아있는 경우 → 초기화
        if (hasSession && hasPromptCache) {
            const sessionMessages = chatSessions.get(chatid);
            const cachedMessages = promptCache[companyname]?.messages || [];

            // 세션 메시지와 캐시 메시지 비교 (길이나 내용 다르면 초기화)
            if (
                sessionMessages.length !== cachedMessages.length ||
                JSON.stringify(sessionMessages.slice(0, 3)) !== JSON.stringify(cachedMessages.slice(0, 3))
            ) {
                console.log(`[chatGPT] 세션 캐시와 promptCache 불일치 → 세션 초기화`);
                chatSessions.delete(chatid);
            }
        }

        // 2. 새 세션이면 캐시 prompt 또는 trainData로 초기화
        if (!chatSessions.has(chatid)) {
            if (!promptCache[companyname]) {
                reloadPrompt(companyname);
            }
            const companyPrompt = promptCache[companyname] || trainData[companyname];
            let messages = [...(companyPrompt?.messages || [])];

            messages.push({ role: 'system', content: instructions.reservationInstruction() });
            messages.push({ role: 'system', content: instructions.cancelInstruction() });
            messages.push({ role: 'system', content: instructions.scopeInstruction() });

            chatSessions.set(chatid, messages);
            console.log(`[chatGPT] 새로운 세션 초기화 완료: ${chatid}`);
        }

        // 3. 사용자 메시지 추가
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