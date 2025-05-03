import fs from 'fs';
import path from 'path';

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function parseJsonObject(input) {
    if (typeof input === 'object' && input !== null) return input;
    if (typeof input !== 'string') return {};

    const jsonStart = input.indexOf('{');
    if (jsonStart === -1) return {};

    let bracketCount = 0;
    for (let i = jsonStart; i < input.length; i++) {
        if (input[i] === '{') bracketCount++;
        if (input[i] === '}') bracketCount--;
        if (bracketCount === 0) {
            const jsonString = input.substring(jsonStart, i + 1);
            try {
                return JSON.parse(jsonString);
            } catch (e) {
                return {};
            }
        }
    }
    return {};
}

export function saveJsonToFile(jsonObject, filename) {
    const jsonData = JSON.stringify(jsonObject, null, 2);
    fs.writeFileSync(filename, jsonData, 'utf-8');
    console.log(`[saveJsonToFile] Saved: ${filename}`);
}

export function saveQnAData(newQuestions, companyname) {
    const filePath = path.resolve('data/questionData', `${companyname}.questions.json`);
    let existing = [];
    if (fs.existsSync(filePath)) {
        try {
            existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        } catch (err) {
            console.error('[saveQnAData] 기존 파일 파싱 실패:', err);
        }
    }
    const combined = [...existing, ...newQuestions];
    saveJsonToFile(combined, filePath);
}

export function saveTrainData(promptmsg, companyname) {
    const filePath = path.resolve('data/trainData', `${companyname}.prompt.json`);
    saveJsonToFile(promptmsg, filePath);
}

export function appendQnAData(qnalist, companyname) {
    const filePath = path.resolve('data/trainData', `${companyname}.questions.json`);
    if (!fs.existsSync(filePath)) return;

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const promptmsg = JSON.parse(fileContent);
    const added = {
        role: 'system',
        content: JSON.stringify(qnalist),
    };
    promptmsg.messages.push(added);
    saveTrainData(promptmsg, companyname);
}

//noInfo.js 새로운 답변 추가
export function appendTrainData(newMessages, companyname) {
    const filePath = path.resolve('data/trainData', `${companyname}.prompt.json`);
    if (!fs.existsSync(filePath)) return;

    try {
        const promptmsg = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        for (const msg of newMessages) {
            promptmsg.messages.push(msg);
        }

        saveJsonToFile(promptmsg, filePath);
    } catch (err) {
        console.error('[appendTrainData] 파일 처리 실패:', err);
    }
}

export function getNoInfoQueries(companyname) {
    const filePath = path.resolve('data/noInfoData', `${companyname}.inInfo.json`);

    try {
        if (!fs.existsSync(filePath)) return [];

        const raw = fs.readFileSync(filePath, 'utf-8');
        let data = JSON.parse(raw);

        // 문자열 배열이면 객체 배열로 변환 후 파일에 다시 저장
        if (typeof data[0] === 'string') {
            data = data.map(q => ({ question: q, count: 1 }));

            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
            console.log(`[getNoInfoQueries] '${companyname}' inInfo.json 마이그레이션 완료`);
        }

        return data;
    } catch (e) {
        console.error('[getNoInfoQueries] 실패:', e);
        return [];
    }
}


export function savenoInfoQuery(noinfoquery, companyname) {
    const filePath = path.resolve('data/noInfoData', `${companyname}.inInfo.json`);
    let dataArray = getNoInfoQueries(companyname);

    if (!Array.isArray(dataArray)) dataArray = [];

    const existing = dataArray.find(item => item.question === noinfoquery.content);

    if (existing) {
        existing.count += 1;
    } else {
        dataArray.push({ question: noinfoquery.content, count: 1 });
    }

    saveJsonToFile(dataArray, filePath);
    console.log(`[savenoInfoQuery] 저장됨: ${noinfoquery.content}`);
}

export function removeNoInfoQuestions(questionsToRemove, companyname) {
    const filePath = path.resolve('data/noInfoData', `${companyname}.inInfo.json`);

    try {
        if (!fs.existsSync(filePath)) return;

        const existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        const updated = existing.filter(
            item => !questionsToRemove.includes(item.question)
        );

        fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf-8');
        console.log(`[removeNoInfoQuestions] ${questionsToRemove.length}개 질문 제거됨`);
    } catch (err) {
        console.error('[removeNoInfoQuestions] 처리 실패:', err);
    }
}


export const promptCache = {}; // 회사별 prompt 저장소 (메모리 캐시)

export function reloadPrompt(company) {
    const filePath = path.resolve('data/trainData', `${company}.prompt.json`);
    if (!fs.existsSync(filePath)) {
        console.warn(`[reloadPrompt] ${company}의 prompt 파일 없음`);
        return;
    }

    try {
        const promptData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        promptCache[company] = promptData;
        console.log(`[reloadPrompt] ${company} prompt 다시 로딩 완료`);
    } catch (err) {
        console.error('[reloadPrompt] 파일 읽기 실패:', err);
    }
}