import React, { useState } from 'react';
import styled from 'styled-components';
import {PageContainer, PageTitle, StyledInput} from "../components/CommonUI";



const CompanyInput = styled.input`
  width: 100%;
  padding: 1rem;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: #007aff;
  }
`;

const QnaBox = styled.div`
  width: 100%;
  margin: 1rem auto;
  border: 1px solid #eee;
  padding: 0.3rem 1rem;
  border-radius: 12px;
  background-color: #fafafa;
  position: relative;
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;
  box-sizing: border-box;
  text-align: center;

  &.removing {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const RemoveBtn = styled.button`
  position: absolute;
  top: -10px;
  right: -10px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background-color: #BDBDBD;
  color: black;
  font-weight: bold;
  font-size: 0.9rem;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);

  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: scale(1.1);
    background-color: #c0392b;
  }
`;

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

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
`;

const CreateCompany = () => {
  const [companyname, setCompanyname] = useState('');
  const [qnaList, setQnaList] = useState([{ question: '', answer: '' }]);
  const [mode, setMode] = useState('manual');
  const [showExample, setShowExample] = useState(false);

  const addRow = () => setQnaList([...qnaList, { question: '', answer: '' }]);
  const updateQna = (index, field, value) => {
    const updated = [...qnaList];
    updated[index][field] = value;
    setQnaList(updated);
  };
  const removeRow = (index) => {
    const updated = [...qnaList];
    updated.splice(index, 1);
    setQnaList(updated);
  };
  const clearAllQna = () => setQnaList([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyname.trim()) return alert('병원 이름을 입력해주세요');

    try {
      const response = await fetch('http://localhost:3000/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyname, questions: qnaList }),
      });
      const result = await response.json();
      if (response.ok) alert('병원 생성 완료!');
      else alert(result.message || '생성 실패');
    } catch (err) {
      console.error(err);
      alert('서버 오류 발생');
    }
  };

  const handleJsonUpload = async (file) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed.companyname || !Array.isArray(parsed.questions)) {
        alert('JSON 형식이 올바르지 않습니다.');
        return;
      }
      const response = await fetch('http://localhost:3000/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });
      const result = await response.json();
      if (response.ok) alert('JSON 업로드로 병원 생성 완료!');
      else alert(result.message || '생성 실패');
    } catch (err) {
      console.error(err);
      alert('JSON 파일 파싱 실패');
    }
  };

  const handleTxtUpload = async (file) => {
    try {
      const text = await file.text();
      const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

      let cname = '';
      const questions = [];
      let currentQ = '', currentA = '';

      for (let line of lines) {
        if (line.startsWith('병원명:')) {
          cname = line.replace('병원명:', '').trim();
        } else if (line.startsWith('Q:')) {
          if (currentQ && currentA) questions.push({ question: currentQ, answer: currentA });
          currentQ = line.replace('Q:', '').trim();
          currentA = '';
        } else if (line.startsWith('A:')) {
          currentA = line.replace('A:', '').trim();
        }
      }
      if (currentQ && currentA) questions.push({ question: currentQ, answer: currentA });

      if (!cname) return alert('txt 파일에 병원명: 이 누락되었습니다');
      if (questions.length === 0) return alert('질문-답변이 1개 이상 필요합니다');

      const response = await fetch('http://localhost:3000/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyname: cname, questions }),
      });

      const result = await response.json();
      if (response.ok) alert('TXT 업로드로 병원 생성 완료!');
      else alert(result.message || '생성 실패');
    } catch (err) {
      console.error(err);
      alert('TXT 파일 파싱 실패');
    }
  };

  return (
    <PageContainer>
      <PageTitle>🏥 새 병원 생성</PageTitle>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        {['manual', 'json', 'txt'].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: mode === m ? '#ccc' : '#f3f3f3',
              border: 'none',
              borderRadius: m === 'manual' ? '6px 0 0 6px' : m === 'txt' ? '0 6px 6px 0' : '0',
              cursor: 'pointer',
            }}
          >
            {m === 'manual' ? '직접입력' : m === 'json' ? 'JSON' : 'TXT'}
          </button>
        ))}
      </div>

      {mode === 'manual' && (
        <form onSubmit={handleSubmit}>
          <CompanyInput
            type="text"
            placeholder="병원명을 입력하세요"
            value={companyname}
            onChange={(e) => setCompanyname(e.target.value)}
          />
          {qnaList.map((qna, idx) => (
            <QnaBox key={idx}>
              <RemoveBtn onClick={() => removeRow(idx)}>×</RemoveBtn>
              <StyledInput
                type="text"
                placeholder="질문"
                value={qna.question}
                onChange={(e) => updateQna(idx, 'question', e.target.value)}
              />
              <StyledInput
                type="text"
                placeholder="답변"
                value={qna.answer}
                onChange={(e) => updateQna(idx, 'answer', e.target.value)}
              />
            </QnaBox>
          ))}
          <ButtonGroup>
            <div>
              <Button type="button" onClick={addRow}>➕ 질문 추가</Button>
              <Button type="button" onClick={clearAllQna}>🗑 질문 모두 삭제</Button>
            </div>
            <Button type="submit" primary>병원 생성하기</Button>
          </ButtonGroup>
        </form>
      )}

      {['json', 'txt'].includes(mode) && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (!file) return;
            if (mode === 'json' && file.name.endsWith('.json')) handleJsonUpload(file);
            else if (mode === 'txt' && file.name.endsWith('.txt')) handleTxtUpload(file);
            else alert('지원하지 않는 파일 형식입니다.');
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 2rem',
            border: '2px dashed #ccc',
            borderRadius: '12px',
            backgroundColor: '#f9f9f9',
            textAlign: 'center',
          }}
        >
          <label
            style={{
              backgroundColor: '#eee',
              color: '#333',
              padding: '1rem 2rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: '0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#007aff';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#eee';
              e.currentTarget.style.color = '#333';
            }}
          >
            📁 {mode.toUpperCase()} 파일 업로드
            <input
              type="file"
              accept={mode === 'json' ? '.json' : '.txt'}
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                if (mode === 'json') handleJsonUpload(file);
                else handleTxtUpload(file);
              }}
            />
          </label>
          <p style={{ marginTop: '1rem', color: '#777' }}>또는 이 영역에 파일을 끌어다 놓으세요</p>
        </div>
      )}

      {mode === 'txt' && (
        <div style={{ marginTop: '1rem' }}>
          <button
            onClick={() => setShowExample(!showExample)}
            style={{
              background: '#f3f3f3',
              color: '#333',
              padding: '0.5rem 1rem',
              border: '1px solid #ccc',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: 'bold',
            }}
          >
            📄 예시 형식 {showExample ? '닫기' : '보기'}
          </button>
          {showExample && (
            <pre style={{
              background: '#f0f0f0',
              padding: '1rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              textAlign: 'left',
              width: '100%',
              maxWidth: '700px',
              overflowX: 'auto',
              marginTop: '0.5rem',
            }}>
{`병원명: 강남병원

Q: 병원 운영 시간은?
A: 오전 9시부터 오후 6시까지 운영합니다.

Q: 응급실 있나요?
A: 응급실은 24시간 운영됩니다.`}
            </pre>
          )}
        </div>
      )}
    </PageContainer>
  );
};

export default CreateCompany;
