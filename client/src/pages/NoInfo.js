// src/pages/NoInfo.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const NoInfo = () => {
    const { company } = useParams();
    const [qnaList, setQnaList] = useState([]);

    useEffect(() => {
        fetch(`http://localhost:3000/noinfo/${company}`)
            .then(res => res.json())
            .then(data => {
                setQnaList(data.map(q => ({ original: q, question: q, answer: '' })));
            });
    }, [company]);

    const updateQna = (index, field, value) => {
        const updated = [...qnaList];
        updated[index][field] = value;
        setQnaList(updated);
    };

    const removeQna = (index) => {
        const updated = [...qnaList];
        updated.splice(index, 1);
        setQnaList(updated);
    };

    const handleSubmit = async () => {
        const valid = qnaList.filter(q => q.question && q.answer);
        if (valid.length === 0) return alert('답변이 입력된 질문이 없습니다.');

        const res = await fetch(`http://localhost:3000/noinfo/${company}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(valid)
        });

        if (res.ok) {
            alert('학습 반영 완료!');
            // 답변 안 된 질문만 다시 남기기
            const remaining = qnaList.filter(q => !q.answer);
            setQnaList(remaining);
        } else {
            alert('저장 실패');
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>질문에 답해주세요</h2>
            {qnaList.length === 0 ? (
                <p>미응답 질문이 없습니다.</p>
            ) : (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                >
                    {qnaList.map((qna, index) => (
                        <div key={index} style={{ marginBottom: '1.5rem' }}>
                            <input
                                type="text"
                                value={qna.question}
                                onChange={(e) => updateQna(index, 'question', e.target.value)}
                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', marginBottom: '0.5rem' }}
                            />
                            <input
                                type="text"
                                placeholder="답변 입력..."
                                value={qna.answer}
                                onChange={(e) => updateQna(index, 'answer', e.target.value)}
                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}
                            />
                            <button
                                type="button"
                                onClick={() => removeQna(index)}
                                style={{ marginTop: '4px', color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                삭제
                            </button>
                        </div>
                    ))}
                    <button
                        type="submit"
                        style={{ backgroundColor: '#007bff', color: 'white', padding: '10px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        학습 반영
                    </button>
                </form>
            )}
        </div>
    );
};

export default NoInfo;
