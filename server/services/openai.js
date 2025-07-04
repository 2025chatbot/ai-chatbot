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

        // 1. 프롬프트가 갱신되어 있지만 세션이 살아있는 경우 → 시스템 메시지만 업데이트
        if (hasSession && hasPromptCache) {
            const sessionMessages = chatSessions.get(chatid);
            const cachedMessages = promptCache[companyname]?.messages || [];

            // 시스템 메시지만 비교 (role: 'system'인 메시지들)
            const sessionSystemMessages = sessionMessages.filter(msg => msg.role === 'system');
            const cachedSystemMessages = cachedMessages.filter(msg => msg.role === 'system');
            
            // 추가 시스템 instruction들
            const additionalSystemMessages = [
                { role: 'system', content: instructions.reservationInstruction() },
                { role: 'system', content: instructions.cancelInstruction() },
                { role: 'system', content: instructions.scopeInstruction() }
            ];
            
            const expectedSystemMessages = [...cachedSystemMessages, ...additionalSystemMessages];

            // 시스템 메시지가 다르면 업데이트 (대화 내역은 유지)
            if (JSON.stringify(sessionSystemMessages) !== JSON.stringify(expectedSystemMessages)) {
                console.log(`[chatGPT] 학습 데이터 업데이트 감지 → 시스템 메시지만 업데이트`);
                
                // 사용자와 어시스턴트 대화만 추출
                const conversationMessages = sessionMessages.filter(msg => 
                    msg.role === 'user' || msg.role === 'assistant'
                );
                
                // 새로운 시스템 메시지 + 기존 대화 내역으로 재구성
                const updatedMessages = [...expectedSystemMessages, ...conversationMessages];
                chatSessions.set(chatid, updatedMessages);
                
                console.log(`[chatGPT] 대화 내역 유지됨. 시스템 메시지 업데이트 완료: ${chatid}`);
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