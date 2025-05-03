import fs from 'fs';
import path from 'path';
import {promptCache} from "./util.js";

export function LoadTrainData() {
    console.log("[LoadTrainData] 시작");

    const trainData = {};
    const directoryPath = path.join(process.cwd(), 'data', 'trainData');

    try {
        const files = fs.readdirSync(directoryPath).filter(file => file.endsWith('.json'));

        for (const file of files) {
            const filePath = path.join(directoryPath, file);
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const jsonData = JSON.parse(fileContent);
            trainData[jsonData.companyname] = jsonData;

            promptCache[jsonData.companyname] = jsonData;
        }

        console.log("[LoadTrainData] 완료", Object.keys(trainData));
        return trainData;
    } catch (err) {
        console.error("[LoadTrainData] 실패:", err);
        return trainData;
    }
}
