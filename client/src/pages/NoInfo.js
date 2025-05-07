import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, TextField, Stack } from '@mui/material';
import {
    PageContainer,
    PageTitle,
    QnaBox,
    RemoveBtn,
    PrimaryButton,
    SecondaryButton, StyledInput,
} from '../components/CommonUI'; // 각 styled 컴포넌트가 있는 파일로 경로 조정 필요

const NoInfo = () => {
    const { company } = useParams();
    const [qnaList, setQnaList] = useState([]);

    useEffect(() => {
        fetch(`http://localhost:3000/noinfo/${company}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setQnaList(
                        data.map(q => ({
                            original: q.question,
                            question: q.question,
                            answer: '',
                            count: q.count,
                        }))
                    );
                } else {
                    setQnaList([]);
                }
            })
            .catch(err => {
                console.error('❌ fetch 실패:', err);
                setQnaList([]);
            });
    }, [company]);

    const updateQna = (index, field, value) => {
        const updated = [...qnaList];
        updated[index][field] = value;
        setQnaList(updated);
    };

    const removeQna = async (index) => {
        const target = qnaList[index];
        if (!window.confirm(`"${target.question}" 질문을 삭제할까요?`)) return;

        const res = await fetch(`http://localhost:3000/noinfo/${company}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: target.original })
        });

        if (res.ok) {
            const updated = [...qnaList];
            updated.splice(index, 1);
            setQnaList(updated);
        } else {
            alert('서버 삭제 실패');
        }
    };

    const handleSubmit = async () => {
        const unanswered = qnaList.filter(q => q.question && !q.answer);
        const valid = qnaList.filter(q => q.question && q.answer);

        if (qnaList.length === 0) return alert('질문이 없습니다.');
        if (valid.length === 0 && unanswered.length > 0)
            return alert('답변이 입력된 질문이 없습니다.');

        const res = await fetch(`http://localhost:3000/noinfo/${company}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(valid)
        });

        if (res.ok) {
            alert('학습 반영 완료!');
            const remaining = qnaList.filter(
                q => !valid.find(v => v.original === q.original)
            );
            setQnaList(remaining);
        } else {
            alert('저장 실패');
        }
    };

    return (
        <PageContainer>
            <PageTitle>❓ 답변 대기 질문 목록</PageTitle>

            {qnaList.length === 0 ? (
                <Typography textAlign="center" color="text.secondary">
                    새로운 질문이 없습니다.
                </Typography>
            ) : (
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                >
                    <Stack spacing={3}>
                        {qnaList.map((qna, index) => (
                            <QnaBox key={index}>
                                <RemoveBtn onClick={() => removeQna(index)}>×</RemoveBtn>
                                <div style={{ marginBottom: '0.75rem' }}>
    <span style={{
        fontSize: '0.85rem',
        backgroundColor: '#e3f2fd',
        color: '#1565c0',
        padding: '0.2rem 0.6rem',
        marginTop : '0.7rem',
        borderRadius: '6px',
        fontWeight: 500,
        display: 'inline-block',
    }}>
      문의 횟수: {qna.count || 1}
    </span>
                                </div>
                                <StyledInput
                                    type="text"
                                    placeholder="질문"
                                    value={qna.question}
                                    onChange={(e) => updateQna(index, 'question', e.target.value)}
                                    style={{ marginBottom: '1rem' }}
                                />
                                <StyledInput
                                type="text"
                                placeholder="답변"
                                value={qna.answer}
                                onChange={(e) => updateQna(index, 'answer', e.target.value)}
                            />
                            </QnaBox>
                        ))}

                        <div style={{ textAlign: 'end', marginTop: '2rem' }}>
                            <PrimaryButton type="submit" style={{ marginLeft: '0.8rem' }}>
                                저장하기
                            </PrimaryButton>
                        </div>
                    </Stack>
                </form>
            )}
        </PageContainer>
    );
};

export default NoInfo;
