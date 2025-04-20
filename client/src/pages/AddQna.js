import React, { useState } from 'react';

const AddQna = () => {
    const [qnaList, setQnaList] = useState([
        { question: '질문_0', answer: '대답_0' },
        { question: '질문_1', answer: '대답_1' },
        { question: '질문_2', answer: '대답_2' },
    ]);
    const [companyName, setCompanyName] = useState('apple');

    const handleChangeCompany = (e) => {
        setCompanyName(e.target.value);
    };

    const handleAddRow = () => {
        setQnaList([...qnaList, { question: '', answer: '' }]);
    };

    const handleChange = (index, field, value) => {
        const updated = [...qnaList];
        updated[index][field] = value;
        setQnaList(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`/addqna/${companyName}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(qnaList),
            });
            const data = await res.json();
            alert('제출 완료!');
        } catch (err) {
            alert('제출 실패');
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">질문과 답을 입력해 주세요</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    회사 이름: <input value={companyName} onChange={handleChangeCompany} className="border p-1 ml-2" />
                </div>
                <table className="w-full border mt-4">
                    <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2">Question</th>
                        <th className="border p-2">Answer</th>
                    </tr>
                    </thead>
                    <tbody>
                    {qnaList.map((item, index) => (
                        <tr key={index}>
                            <td className="border p-2">
                                <input
                                    type="text"
                                    value={item.question}
                                    onChange={(e) => handleChange(index, 'question', e.target.value)}
                                    className="w-full border px-2 py-1"
                                />
                            </td>
                            <td className="border p-2">
                                <input
                                    type="text"
                                    value={item.answer}
                                    onChange={(e) => handleChange(index, 'answer', e.target.value)}
                                    className="w-full border px-2 py-1"
                                />
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                <button type="button" onClick={handleAddRow} className="bg-green-500 text-white px-3 py-1 rounded">
                    행 추가
                </button>
                <br />
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                    제출
                </button>
            </form>
        </div>
    );
};

export default AddQna;