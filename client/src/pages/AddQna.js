import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
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

const AddQna = () => {
  const { name: companyName } = useParams();
  const [hospitalName, setHospitalName] = useState(companyName);
  const [qnaList, setQnaList] = useState([
    { question: '', answer: '' },
  ]);

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
      const data = await res.json();
      alert('제출 완료!');
    } catch (err) {
      console.log("제출 실패 : ", err);
      alert('제출 실패');
    }
  };

  return (
    <Container>
      <Title>🏥 질문과 답변 추가하기</Title>
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="병원 이름을 입력하세요"
          value={hospitalName}
          onChange={(e) => setHospitalName(e.target.value)}
        />
        {qnaList.map((item, index) => (
          <QnaBox key={index}>
            <RemoveBtn onClick={() => handleRemoveRow(index)}>×</RemoveBtn>
            <Input
              type="text"
              placeholder="질문"
              value={item.question}
              onChange={(e) => handleChange(index, 'question', e.target.value)}
            />
            <Input
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
          <Button type="submit" primary>💾 저장하기</Button>
        </ButtonGroup>
      </form>
    </Container>
  );
};

export default AddQna;