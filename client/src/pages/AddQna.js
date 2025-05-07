import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import {PageContainer, PageTitle, QnaBox, RemoveBtn, StyledInput, ButtonGroup} from "../components/CommonUI";

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
      </form>
    </PageContainer>
  );
};

export default AddQna;