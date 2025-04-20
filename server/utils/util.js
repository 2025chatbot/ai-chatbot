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

export function saveQnAData(questions, companyname) {
    const filePath = path.resolve('data/questionData', `${companyname}.questions.json`);
    saveJsonToFile(questions, filePath);
}

export function saveTrainData(promptmsg, companyname) {
    const filePath = path.resolve('data/trainData', `${companyname}.prompt.json`);
    saveJsonToFile(promptmsg, filePath);
}

export function appendQnAData(qnalist, companyname) {
    const filePath = path.resolve('data/trainData', `${companyname}.prompt.json`);
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

export function getNoInfoQueries(companyname) {
    const filePath = path.resolve('data/noInfoData', `${companyname}.inInfo.json`);
    try {
        if (!fs.existsSync(filePath)) return [];
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        console.error('[getNoInfoQueries] 실패:', e);
        return [];
    }
}

export function savenoInfoQuery(noinfoquery, companyname) {
    const filePath = path.resolve('data/noInfoData', `${companyname}.inInfo.json`);
    const dataArray = getNoInfoQueries(companyname);
    dataArray.push(noinfoquery.content);
    saveJsonToFile(dataArray, filePath);
    console.log(`[savenoInfoQuery] 추가됨: ${noinfoquery.content}`);
}