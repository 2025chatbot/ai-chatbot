import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const NoInfo = () => {
    const { company } = useParams();
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);

    useEffect(() => {
        fetch(`/noinfo/${company}.inInfo.json`)
            .then((res) => res.json())
            .then((data) => {
                setQuestions(data);
                setAnswers(Array(data.length).fill(''));
            });
    }, [company]);

    const handleChange = (index, value) => {
        const updated = [...answers];
        updated[index] = value;
        setAnswers(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const qnaArray = questions.map((q, i) => ({ question: q, answer: answers[i] }));

        try {
            const res = await fetch(`/addqna/${company}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(qnaArray),
            });
            const data = await res.json();
            alert('제출 완료!');
        } catch (err) {
            alert('제출 실패');
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">질문에 답해주세요</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {questions.map((q, index) => (
                    <div key={index}>
                        <label className="block mb-1">{q}</label>
                        <input
                            type="text"
                            value={answers[index] || ''}
                            onChange={(e) => handleChange(index, e.target.value)}
                            className="w-full border px-2 py-1"
                        />
                    </div>
                ))}
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded mt-4">
                    제출
                </button>
            </form>
        </div>
    );
};

export default NoInfo;
