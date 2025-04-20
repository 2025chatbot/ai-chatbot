import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const CompanyList = () => {
    const [companies, setCompanies] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3000/companies')
            .then((res) => res.json())
            .then((data) => setCompanies(data))
            .catch((err) => {
                console.error('병원 목록 불러오기 실패:', err);
                setCompanies([]);
            });
    }, []);

    return (
        <div style={{ padding: '2rem' }}>
            <h2>📋 등록된 병원 목록</h2>
            {companies.length === 0 ? (
                <p>등록된 병원이 없습니다.</p>
            ) : (
                <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                    {companies.map((name) => (
                        <li key={name} style={{ marginBottom: '1rem' }}>
                            <strong>{name}</strong><br />
                            <Link to={`/company/${name}`} style={{ marginRight: '1rem' }}>
                                ▶ 병원 페이지 이동
                            </Link>
                            <Link to={`/noInfo/${name}`}>
                                💡 qna 업데이트
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CompanyList;
