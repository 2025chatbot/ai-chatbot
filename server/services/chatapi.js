import { getCompletionChatGPT } from './openai.js';
import { getCompletionOllama } from './ollama.js';
import { LoadTrainData } from '../utils/traindata.js';

let trainData = LoadTrainData();

export const reloadTrainData = () => {
    trainData = LoadTrainData();
};

export const generateChatResponse = async (chatid, userMessage) => {
    try {
        const model = process.env.CHATAPI_MODEL || 'chatgpt';
        if (model === 'ollama') {
            return await getCompletionOllama(trainData, chatid, userMessage);
        } else {
            return await getCompletionChatGPT(trainData, chatid, userMessage);
        }
    } catch (err) {
        console.error('[generateChatResponse] 실패:', err);
        return { content: '챗봇 응답 실패' };
    }
};