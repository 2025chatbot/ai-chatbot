import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { PageContainer, PageTitle, QnaBox, RemoveBtn, StyledInput, ButtonGroup, SecondaryButton } from "../components/CommonUI";

const Button = styled.button`
  padding: 0.8rem 1.2rem;
  font-size: 1rem;
  margin-top: 1rem;
  border: none;
  border-radius: 8px;
  background-color: ${({ primary }) => (primary ? '#007aff' : '#eee')};
  color: ${({ primary }) => (primary ? '#fff' : '#333')};
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }

  & + & {
    margin-left: 0.8rem;
  }
`;

const TabSelector = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
  gap: 1rem;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 0.8rem;
  background-color: ${({ active }) => (active ? '#007aff' : '#f3f3f3')};
  color: ${({ active }) => (active ? '#fff' : '#333')};
  border: 1px solid #ccc;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
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
  position: relative;
`;

const HiddenInput = styled.input`
  display: none;
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

const AddQna = () => {
  const { name: companyName } = useParams();
  const [hospitalName, setHospitalName] = useState(companyName);
  const [qnaList, setQnaList] = useState([{ question: '', answer: '' }]);
  const [tab, setTab] = useState('manual');
  const [fileType, setFileType] = useState('txt');
  const [showExample, setShowExample] = useState(false);
  const fileInputRef = useRef(null);

  const handleAddRow = () => {
    setQnaList([...qnaList, { question: '', answer: '' }]);
  };

  const handleRemoveRow = (index) => {
    const updated = qnaList.filter((_, i) => i !== index);
    setQnaList(updated);
  };

  const handleChange = (index, field, value) => {
    const updated = [...qnaList];
    updated[index][field] = value;
    setQnaList(updated);
  };

  const clearAllQna = () => {
    setQnaList([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:3000/addqna/${hospitalName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(qnaList),
      });
      await res.json();
      alert('제출 완료!');
    } catch (err) {
      console.log("제출 실패 : ", err);
      alert('제출 실패');
    }
  };

  const parseText = async (text) => {
    if (fileType === 'json') {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed;
      // Handle cases where JSON might have a root object with a 'questions' array
      if (parsed.questions && Array.isArray(parsed.questions)) {
        return parsed.questions;
      }
      // Handle cases where the JSON directly contains the Q&A pairs (e.g., from the example)
      if (parsed.companyname && parsed.questions && Array.isArray(parsed.questions)) {
        return parsed.questions;
      }
      throw new Error('Invalid JSON structure. Expected an array or an object with a "questions" array.');
    } else { // TXT parsing
      const lines = text.split('\n').filter(Boolean); // Filter out empty lines
      return lines.map(line => {
        // More flexible regex for TXT: allows optional quotes and trims spaces
        // It tries to capture two parts separated by a comma, optionally enclosed in quotes.
        const match = line.match(/^\s*(["']?)(.*?)\1\s*,\s*(["']?)(.*?)\3\s*$/);
        if (match) {
          // match[2] is the first captured group (question), match[4] is the second (answer)
          return { question: match[2].trim(), answer: match[4].trim() };
        }
        // Fallback for simple comma-separated values without quotes
        const parts = line.split(',');
        if (parts.length >= 2) {
            return { question: parts[0].trim(), answer: parts.slice(1).join(',').trim() };
        }
        throw new Error('Invalid TXT format. Expected "question","answer" or question,answer per line.');
      });
    }
  };

  const handleFileDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (file.type.includes('json') && fileType !== 'json') {
      alert('JSON 파일을 선택하려면 파일 형식을 JSON으로 변경해주세요.');
      return;
    }
    if (file.type.includes('text') && fileType !== 'txt') {
        alert('TXT 파일을 선택하려면 파일 형식을 TXT로 변경해주세요.');
        return;
    }

    try {
      const text = await file.text();
      const parsed = await parseText(text);
      setQnaList(parsed);
    } catch (error) {
      console.error("파일 파싱 중 오류 발생:", error);
      alert(`파일 파싱 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = await parseText(text);
      setQnaList(parsed);
      // Clear the file input after successful parsing
      e.target.value = null; 
    } catch (error) {
      console.error("파일 파싱 중 오류 발생:", error);
      alert(`파일 파싱 중 오류가 발생했습니다: ${error.message}`);
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
      return `"병원 운영 시간은?","오전 9시부터 오후 6시까지 운영합니다."
"응급실 있나요?","응급실은 24시간 운영됩니다."
"예약 방법은?","전화나 온라인으로 예약 가능합니다."
병원 주소,서울시 강남구 테헤란로 123
진료 과목,내과, 외과, 소아청소년과`; // Added a more flexible example for TXT
    }
  };

  return (
    <PageContainer>
      <PageTitle>🏥 질문과 답변 추가하기</PageTitle>
      <StyledInput
        type="text"
        placeholder="병원 이름을 입력하세요"
        value={hospitalName}
        onChange={(e) => setHospitalName(e.target.value)}
      />
      <TabSelector>
        <TabButton active={tab === 'manual'} onClick={() => setTab('manual')}>✏️ 직접 입력</TabButton>
        <TabButton active={tab === 'file'} onClick={() => setTab('file')}>📂 파일 추가</TabButton>
      </TabSelector>

      {tab === 'manual' ? (
        <form onSubmit={handleSubmit}>
          {qnaList.map((item, index) => (
            <QnaBox key={index}>
              <RemoveBtn onClick={() => handleRemoveRow(index)}>×</RemoveBtn>
              <StyledInput
                type="text"
                placeholder="질문"
                value={item.question}
                onChange={(e) => handleChange(index, 'question', e.target.value)}
              />
              <StyledInput
                type="text"
                placeholder="답변"
                value={item.answer}
                onChange={(e) => handleChange(index, 'answer', e.target.value)}
              />
            </QnaBox>
          ))}
          <ButtonGroup>
            <div>
              <Button type="button" onClick={handleAddRow}>➕ 질문 추가</Button>
              <Button type="button" onClick={clearAllQna}>🗑 질문 모두 삭제</Button>
            </div>
            <Button type="submit" primary>저장하기</Button>
          </ButtonGroup>
        </form>
      ) : (
        <div onDrop={handleFileDrop} onDragOver={(e) => e.preventDefault()}>
          <FileTypeSelector>
            <FileTypeButton active={fileType === 'txt'} onClick={() => setFileType('txt')}>TXT</FileTypeButton>
            <FileTypeButton active={fileType === 'json'} onClick={() => setFileType('json')}>JSON</FileTypeButton>
          </FileTypeSelector>

          <FileDropZone>
            <UploadLabel htmlFor="fileUpload">
              📁 {fileType === 'json' ? 'JSON' : 'TXT'} 파일 업로드
            </UploadLabel>
            <HiddenInput
              id="fileUpload"
              type="file"
              accept={fileType === 'json' ? '.json' : '.txt'}
              onChange={handleFileChange}
              ref={fileInputRef}
            />
            <p style={{ marginTop: '0.8rem', color: '#777' }}>또는 이 영역에 파일을 끌어다 놓으세요</p>
          </FileDropZone>

          <SecondaryButton onClick={() => setShowExample(!showExample)} style={{ marginTop: '1rem' }}>
            📄 예시 형식 {showExample ? '닫기' : '보기'}
          </SecondaryButton>
          {showExample && (
            <pre style={{ backgroundColor: '#f0f0f0', padding: '1rem', marginTop: '1rem', borderRadius: '8px', fontFamily: 'Apple SD Gothic Neo, sans-serif' }}>
              {getExampleText()}
            </pre>
          )}
          {qnaList.length > 0 && ( // Display parsed Q&A list if available
            <>
              <h3 style={{ marginTop: '2rem' }}>불러온 질문과 답변 ({qnaList.length}개)</h3>
              {qnaList.map((item, index) => (
                <QnaBox key={index}>
                  <RemoveBtn onClick={() => handleRemoveRow(index)}>×</RemoveBtn>
                  <StyledInput
                    type="text"
                    placeholder="질문"
                    value={item.question}
                    onChange={(e) => handleChange(index, 'question', e.target.value)}
                  />
                  <StyledInput
                    type="text"
                    placeholder="답변"
                    value={item.answer}
                    onChange={(e) => handleChange(index, 'answer', e.target.value)}
                  />
                </QnaBox>
              ))}
              <ButtonGroup>
                <div>
                  <Button type="button" onClick={clearAllQna}>🗑 질문 모두 삭제</Button>
                </div>
                <Button type="submit" primary onClick={handleSubmit}>저장하기</Button>
              </ButtonGroup>
            </>
          )}
        </div>
      )}
    </PageContainer>
  );
};

export default AddQna;