import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 800px;
  margin: 5rem auto;
  padding: 2rem;
  background-color: #fdfdfd;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  box-sizing: border-box;
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  margin: 1rem auto;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  outline: none;
  box-sizing: border-box;
  display: block;

  &:focus {
    border-color: #007aff;
  }
`;

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

  const addRow = () => {
    setQnaList([...qnaList, { question: '', answer: '' }]);
  };

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

  const clearAllQna = () => {
    setQnaList([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyname.trim()) return alert('병원 이름을 입력해주세요');

    try {
      const response = await fetch('http://localhost:3000/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyname, questions: qnaList })
      });

      const result = await response.json();
      if (response.ok) {
        alert('병원 생성 완료!');
        // 페이지 이동 필요하면 여기에 추가
      } else {
        alert(result.message || '생성 실패');
      }
    } catch (err) {
      console.error(err);
      alert('서버 오류 발생');
    }
  };

  const handleJsonUpload = async (file) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed.companyname) {
        alert('파일에 병원 이름(companyname)이 빠져 있어요. 예시 형식을 참고해서 다시 저장해주세요.');
        return;
      }
      if (!Array.isArray(parsed.questions)) {
        alert('파일에 질문 목록(questions)이 올바르게 들어있지 않아요. 예시 형식을 확인해주세요.');
        return;
      }

      const response = await fetch('http://localhost:3000/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed)
      });

      const result = await response.json();
      if (response.ok) {
        alert('JSON 업로드로 병원 생성 완료!');
      } else {
        alert(result.message || '생성 실패');
      }
    } catch (err) {
      console.error(err);
      alert('JSON 파일 파싱 실패');
    }
  };

  return (
    <Container>
      <Title>🏥 새 병원 생성</Title>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button
          onClick={() => setMode('manual')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: mode === 'manual' ? '#ccc' : '#f3f3f3',
            border: 'none',
            borderTopLeftRadius: '6px',
            borderBottomLeftRadius: '6px',
            cursor: 'pointer',
          }}
        >
          직접입력
        </button>
        <button
          onClick={() => setMode('json')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: mode === 'json' ? '#ccc' : '#f3f3f3',
            border: 'none',
            borderTopRightRadius: '6px',
            borderBottomRightRadius: '6px',
            cursor: 'pointer',
          }}
        >
          JSON
        </button>
      </div>
      {mode === 'manual' ? (
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
              <Input
                type="text"
                placeholder="질문"
                value={qna.question}
                onChange={(e) => updateQna(idx, 'question', e.target.value)}
              />
              <Input
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
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file && file.name.endsWith('.json')) {
              handleJsonUpload(file);
            }
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
              fontSize: '1rem',
              fontWeight: 'bold',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#007aff';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#eee';
              e.currentTarget.style.color = '#333';
            }}
          >
            📁 JSON 파일 업로드
            <input
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={(e) => e.target.files[0] && handleJsonUpload(e.target.files[0])}
            />
          </label>
          <p style={{ marginTop: '1rem', color: '#777' }}>
            또는 이 영역에 파일을 끌어다 놓으세요
          </p>
        </div>
      )}
      {mode === 'json' && (
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
              fontWeight: 'bold'
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
              marginTop: '0.5rem'
            }}>
{`{
  "companyname": "강남병원",
  "questions": [
    {
      "question": "병원 운영 시간은?",
      "answer": "오전 9시부터 오후 6시까지 운영합니다."
    },
    {
      "question": "응급실 있나요?",
      "answer": "응급실은 24시간 운영됩니다."
    }
  ]
}`}
            </pre>
          )}
        </div>
      )}
    </Container>
  );
};

export default CreateCompany;