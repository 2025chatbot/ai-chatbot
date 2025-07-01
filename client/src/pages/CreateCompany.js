import React, { useState } from 'react';
import styled from 'styled-components';
import { PageContainer, PageTitle, StyledInput, PrimaryButton, SecondaryButton } from "../components/CommonUI";

const TabSelector = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
  gap: 1rem;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 1rem;
  background-color: ${({ active }) => (active ? '#007aff' : '#f3f3f3')};
  color: ${({ active }) => (active ? '#fff' : '#333')};
  border: 1px solid #ccc;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
`;

const ActionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.8rem;
`;

const FileTypeSelector = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const FileTypeButton = styled.button`
  padding: 0.6rem 1.2rem;
  background-color: ${({ active }) => (active ? '#007aff' : '#f3f3f3')};
  color: ${({ active }) => (active ? '#fff' : '#333')};
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  font-family: 'Apple SD Gothic Neo', sans-serif;
`;

const FileDropZone = styled.div`
  border: 2px dashed #ccc;
  border-radius: 12px;
  background-color: #f9f9f9;
  padding: 2rem;
  text-align: center;
`;

const UploadLabel = styled.label`
  display: inline-block;
  background-color: #eee;
  color: #333;
  padding: 1rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: background 0.2s ease;
  &:hover {
    background-color: #e0e0e0;
  }
`;

const CompanyInput = styled(StyledInput)`
  margin-bottom: 0.5rem;
  width: 100%;
`;

const QnaBoxWrapper = styled.div`
  position: relative;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 10px;
  margin-bottom: 1rem;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: -10px;
  right: -10px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  text-align: center;
  cursor: pointer;
  color: #333;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
`;

const CreateCompany = () => {
  const [tab, setTab] = useState('manual');
  const [fileType, setFileType] = useState('txt');
  const [companyname, setCompanyname] = useState('');
  const [qnaList, setQnaList] = useState([{ question: '', answer: '' }]);
  const [showExample, setShowExample] = useState(false);

  const handleFileUpload = async (file) => {
    try {
      const text = await file.text();
      let parsed;

      if (fileType === 'json') {
        parsed = JSON.parse(text);
      } else {
        const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
        parsed = {
          companyname: lines[0]?.replace(/"/g, ''),
          questions: lines.slice(1).map(line => {
            const [question, answer] = line.replace(/"/g, '').split('","');
            return {
              question: question?.replace(/^"/, '') || '',
              answer: answer?.replace(/"$/, '') || ''
            };
          })
        };
      }

      const response = await fetch('http://localhost:3000/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyname: parsed.companyname, questions: parsed.questions })
      });

      const result = await response.json();
      if (response.ok) {
        alert('병원 생성 완료!');
      } else {
        alert(result.message || '생성 실패');
      }
    } catch (error) {
      console.error(error);
      alert('파일 파싱 실패');
    }
  };

  const handleManualSubmit = async () => {
    if (!companyname.trim()) return alert('병원명을 입력하세요');

    const response = await fetch('http://localhost:3000/company', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyname, questions: qnaList })
    });

    const result = await response.json();
    if (response.ok) {
      alert('병원 생성 완료!');
    } else {
      alert(result.message || '생성 실패');
    }
  };

  const getExampleText = () => {
    if (fileType === 'json') {
      return `{
  "companyname": "강남병원",
  "questions": [
    {
      "question": "병원 운영 시간은?",
      "answer": "오전 9시부터 오후 6시까지 운영합니다."
    },
    {
      "question": "응급실 있나요?",
      "answer": "응급실은 24시간 운영됩니다."
    },
    {
      "question": "예약 방법은?",
      "answer": "전화나 온라인으로 예약 가능합니다."
    }
  ]
}`;
    } else {
      return `"강남병원"
"병원 운영 시간은?","오전 9시부터 오후 6시까지 운영합니다."
"응급실 있나요?","응급실은 24시간 운영됩니다."
"예약 방법은?","전화나 온라인으로 예약 가능합니다."`;
    }
  };

  return (
    <PageContainer>
      <PageTitle>🏥 새 병원 생성</PageTitle>
      <TabSelector>
        <TabButton active={tab === 'manual'} onClick={() => setTab('manual')}>✏️ 직접 입력</TabButton>
        <TabButton active={tab === 'file'} onClick={() => setTab('file')}>📂 파일 추가</TabButton>
      </TabSelector>

      {tab === 'manual' ? (
        <div>
          <CompanyInput
            placeholder="병원명을 입력하세요"
            value={companyname}
            onChange={(e) => setCompanyname(e.target.value)}
          />
          {qnaList.map((qna, idx) => (
            <QnaBoxWrapper key={idx}>
              <RemoveButton onClick={() => setQnaList(qnaList.filter((_, i) => i !== idx))}>×</RemoveButton>
              <StyledInput
                placeholder="질문"
                value={qna.question}
                onChange={(e) => {
                  const copy = [...qnaList];
                  copy[idx].question = e.target.value;
                  setQnaList(copy);
                }}
              />
              <StyledInput
                placeholder="답변"
                value={qna.answer}
                onChange={(e) => {
                  const copy = [...qnaList];
                  copy[idx].answer = e.target.value;
                  setQnaList(copy);
                }}
              />
            </QnaBoxWrapper>
          ))}
          <ActionRow>
            <ButtonGroup>
              <SecondaryButton onClick={() => setQnaList([...qnaList, { question: '', answer: '' }])}>➕ 질문 추가</SecondaryButton>
              <SecondaryButton onClick={() => setQnaList([])}>🗑 질문 모두 삭제</SecondaryButton>
            </ButtonGroup>
            <PrimaryButton onClick={handleManualSubmit}>병원 생성하기</PrimaryButton>
          </ActionRow>
        </div>
      ) : (
        <div>
          <FileTypeSelector>
            <FileTypeButton active={fileType === 'txt'} onClick={() => setFileType('txt')}>TXT</FileTypeButton>
            <FileTypeButton active={fileType === 'json'} onClick={() => setFileType('json')}>JSON</FileTypeButton>
          </FileTypeSelector>

          <FileDropZone
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) handleFileUpload(file);
            }}
          >
            <UploadLabel>
              📁 <strong>{fileType.toUpperCase()}</strong> 파일 업로드
              <input
                type="file"
                accept={fileType === 'json' ? '.json' : '.txt'}
                onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
                style={{ display: 'none' }}
              />
            </UploadLabel>
            <p style={{ marginTop: '0.8rem', color: '#777' }}>또는 이 영역에 파일을 끌어다 놓으세요</p>
          </FileDropZone>

          <SecondaryButton
            onClick={() => setShowExample(!showExample)}
            style={{ marginTop: '1rem' }}
          >
            📄 예시 형식 {showExample ? '닫기' : '보기'}
          </SecondaryButton>
          {showExample && (
            <pre style={{ backgroundColor: '#f0f0f0', padding: '1rem', marginTop: '1rem', borderRadius: '8px', fontFamily: 'Apple SD Gothic Neo, sans-serif' }}>
              {getExampleText()}
            </pre>
          )}
        </div>
      )}
    </PageContainer>
  );
};

export default CreateCompany;
