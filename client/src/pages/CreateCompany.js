import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateCompany = () => {
    const [companyname, setCompanyname] = useState('');
    const [qnaList, setQnaList] = useState([{ question: '', answer: '' }]);
    const navigate = useNavigate();

    const addRow = () => {
        setQnaList([...qnaList, { question: '', answer: '' }]);
    };

    const updateQna = (index, field, value) => {
        const updated = [...qnaList];
        updated[index][field] = value;
        setQnaList(updated);
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
                navigate(`/company/${companyname}`);
            } else {
                alert(result.message || '생성 실패');
            }
        } catch (err) {
            console.error(err);
            alert('서버 오류 발생');
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h2>새 병원 생성</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="병원명"
                    value={companyname}
                    onChange={(e) => setCompanyname(e.target.value)}
                    style={{ marginBottom: '1rem', width: '300px' }}
                />

                <table>
                    <thead>
                    <tr><th>질문</th><th>답변</th></tr>
                    </thead>
                    <tbody>
                    {qnaList.map((qna, idx) => (
                        <tr key={idx}>
                            <td>
                                <input
                                    type="text"
                                    value={qna.question}
                                    onChange={(e) => updateQna(idx, 'question', e.target.value)}
                                    style={{ width: '300px' }}
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    value={qna.answer}
                                    onChange={(e) => updateQna(idx, 'answer', e.target.value)}
                                    style={{ width: '300px' }}
                                />
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                <button type="button" onClick={addRow} style={{ margin: '1rem 0' }}>질문 추가</button><br />
                <button type="submit">병원 생성</button>
            </form>
        </div>
    );
};

export default CreateCompany;
