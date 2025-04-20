import fetch from 'node-fetch';

const chatSessions = new Map();

function getBasicInfo(jsonData) {
    return `### 1. (Conversations)
${JSON.stringify(jsonData.conversations, null, 2)}

### 2. (Documents)
${JSON.stringify(jsonData.documents, null, 2)}

### 3. (Tasks)
${JSON.stringify(jsonData.tasks, null, 2)}
  `;
}

export async function getCompletionOllama(trainData, chatid, prompt) {
    try {
        const [companyname] = chatid.split(':');

        if (!chatSessions.has(chatid)) {
            const baseInfo = getBasicInfo(trainData[companyname]);
            const initMessages = [{ role: 'user', content: baseInfo }];
            chatSessions.set(chatid, initMessages);
        }

        const messages = chatSessions.get(chatid);
        messages.push({ role: 'user', content: prompt });

        const ollamaprompt = {
            model: process.env.CHATAPI_MODEL,
            messages,
            stream: false,
        };

        const response = await fetch('http://3.36.74.225:5000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ollamaprompt),
        });

        const result = await response.json();
        const message = result.message;
        messages.push(message);
        chatSessions.set(chatid, messages);

        return message;
    } catch (err) {
        console.error('[Ollama] 처리 실패:', err);
        return { content: 'Ollama 응답 실패' };
    }
}