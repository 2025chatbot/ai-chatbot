import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { PageContainer, PageTitle, QnaBox, RemoveBtn, StyledInput, ButtonGroup } from '../components/CommonUI';

const TextArea = styled.textarea`
  width: 100%;
  height: 120px;
  padding: 1rem;
  margin-top: 1rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  outline: none;
  resize: vertical;
  box-sizing: border-box;
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

const AddQna = () => {
  const { name: companyName } = useParams();
  const [hospitalName, setHospitalName] = useState(companyName || '');
  const [qnaList, setQnaList] = useState([]);
  const [manualText, setManualText] = useState('');

  useEffect(() => {
    const fetchQnaList = async () => {
      try {
        const res = await fetch(`http://localhost:3000/qna/${hospitalName}`);
        const data = await res.json();
        if (Array.isArray(data.qnaList)) {
          setQnaList(data.qnaList);
        } else {
          console.warn('서버 응답이 배열이 아님:', data);
        }
      } catch (err) {
        console.error('QnA 불러오기 실패:', err);
      }
    };

    if (hospitalName) fetchQnaList();
  }, [hospitalName]);

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
      const payload = {
        qnalist: qnaList,
        manualText: manualText,
      };

      const res = await fetch(`http://localhost:3000/addqna/${hospitalName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      alert('제출 완료!');
    } catch (err) {
      console.error("제출 실패:", err);
      alert('제출 실패');
    }
  };

  const handleTxtUpload = async (file) => {
    try {
      const text = await file.text();
      const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

      const parsedQna = [];
      let currentQ = '', currentA = '';

      for (let line of lines) {
        if (line.startsWith('Q:')) {
          if (currentQ && currentA) {
            parsedQna.push({ question: currentQ, answer: currentA });
            currentQ = '';
            currentA = '';
          }
          currentQ = line.replace('Q:', '').trim();
        } else if (line.startsWith('A:')) {
          currentA = line.replace('A:', '').trim();
        }
      }

      if (currentQ && currentA) parsedQna.push({ question: currentQ, answer: currentA });

      if (parsedQna.length === 0) return alert('유효한 질문/답변이 없습니다.');

      const confirm = window.confirm(`${parsedQna.length}개의 QnA를 추가하시겠습니까?`);
      if (confirm) {
        setQnaList(prev => [...prev, ...parsedQna]);
        alert('질문/답변 추가 완료!');
      }
    } catch (err) {
      console.error(err);
      alert('TXT 파일 처리 중 오류 발생');
    }
  };

  return (
    <PageContainer>
      <PageTitle>🏥 질문과 답변 추가하기</PageTitle>
      <form onSubmit={handleSubmit}>
        <StyledInput
          type="text"
          placeholder="병원 이름을 입력하세요"
          value={hospitalName}
          onChange={(e) => setHospitalName(e.target.value)}
        />
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

        <TextArea
          placeholder="GPT가 참고할 설명서 텍스트를 입력하세요"
          value={manualText}
          onChange={(e) => setManualText(e.target.value)}
        />

        {/* 📄 TXT 업로드 영역 */}
        <div style={{ marginTop: '1.5rem' }}>
          <label
            style={{
              backgroundColor: '#eee',
              color: '#333',
              padding: '0.6rem 1.2rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'inline-block'
            }}
          >
            📄 TXT 파일 업로드
            <input
              type="file"
              accept=".txt"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file && file.name.endsWith('.txt')) {
                  handleTxtUpload(file);
                } else {
                  alert('지원되지 않는 파일 형식입니다.');
                }
              }}
            />
          </label>
          <p style={{ color: '#777', marginTop: '0.5rem' }}>Q: / A: 형식의 텍스트 파일을 업로드하세요</p>
        </div>
      </form>
    </PageContainer>
  );
};

export default AddQna;
