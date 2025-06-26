import fs from 'fs';
import path from 'path';
import {
    saveJsonToFile,
    saveQnAData,
    saveTrainData
} from '../utils/util.js';
import crypto from 'crypto';

const generateCompanyId = () => {
    return crypto.randomBytes(2).toString('hex'); // 예: '7f3a'
};

export const createCompany = async (req, res) => {
    const { companyname, questions, manualText } = req.body;

    if (!companyname || !questions || !Array.isArray(questions)) {
        return res.status(400).json({ message: '입력값이 잘못되었습니다.' });
    }

    try {
        saveQnAData(questions, companyname);

        const companyid = generateCompanyId();

        const promptmsg = {
            companyname,
            companyid,
            date: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
            author: 'system',
            messages: [
                {
                    role: 'system',
                    content: JSON.stringify(questions)
                }
            ]
        };

        saveTrainData(promptmsg, companyname);

        // ⬇️ manualText가 있다면 별도 파일로 저장
        if (manualText && manualText.trim()) {
            const manualPrompt = {
                companyname,
                companyid: 'manual',
                date: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
                author: 'manual',
                messages: [
                    {
                        role: 'system',
                        content: manualText
                    }
                ]
            };
            const filePath = path.join('data/trainData', `${companyname}.manual.prompt.json`);
            saveJsonToFile(manualPrompt, filePath);
        }

        res.json({ message: `${companyname} 생성 완료` });
    } catch (err) {
        console.error('[createCompany] 오류:', err);
        res.status(500).json({ message: '회사 생성 실패' });
    }
};

export const getCompanyList = (req, res) => {
    const directoryPath = path.join(process.cwd(), 'data', 'trainData');

    try {
        const files = fs.readdirSync(directoryPath).filter(file => file.endsWith('.json'));
        const companyNames = files.map(file => path.basename(file, '.prompt.json'));
        res.json(companyNames);
    } catch (err) {
        console.error('[getCompanyList] 오류:', err);
        res.status(500).json({ message: '회사 목록 불러오기 실패' });
    }
};
