import { parseJsonObject, savenoInfoQuery } from '../utils/util.js';

function reservationMsg(pJson) {
    return `예약이 확정되었습니다.<br>이름: ${pJson.name}<br>전화번호: ${pJson.phone}<br>날짜: ${pJson.date}<br>시간: ${pJson.time}`;
}

function reservationCheckMsg(pJson) {
    return `이 예약 정보가 맞습니까?<br>이름: ${pJson.name}<br>전화번호: ${pJson.phone}<br>날짜: ${pJson.date}<br>시간: ${pJson.time}`;
}

function cancelMsg(pJson) {
    return `예약 취소가 확정되었습니다.<br>이름: ${pJson.name}<br>전화번호: ${pJson.phone}<br>날짜: ${pJson.date}<br>시간: ${pJson.time}`;
}

function cancelCheckMsg(pJson) {
    return `이 예약 취소 정보가 맞습니까?<br>이름: ${pJson.name}<br>전화번호: ${pJson.phone}<br>날짜: ${pJson.date}<br>시간: ${pJson.time}`;
}

export function parseLLMMsg(responseMessage, messages, companyname) {
    const pJson = parseJsonObject(responseMessage.content);

    if (pJson.request === 'reservation') {
        return { content: reservationMsg(pJson) };
    } else if (pJson.request === 'reservationcheck') {
        return { content: reservationCheckMsg(pJson) };
    } else if (pJson.request === 'cancel') {
        return { content: cancelMsg(pJson) };
    } else if (pJson.request === 'cancelcheck') {
        return { content: cancelCheckMsg(pJson) };
    } else if (responseMessage.content.startsWith('죄송') ||
        responseMessage.content.includes('제공되지') ||
        responseMessage.content.includes('찾을 수 없습니다') ||
        responseMessage.content.includes('정보가 없습니다')) {
        const userMessage = [...messages].reverse().find(m => m.role === 'user');
        if (userMessage) {
            savenoInfoQuery({ content: userMessage.content }, companyname);
        }

    }

    return {
        ...responseMessage,
        content: responseMessage.content.replaceAll('\n', '<br>').replaceAll('\r', '')
    };
}
