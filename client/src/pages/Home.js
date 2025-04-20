import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div style={{ padding: '2rem' }}>
            <h2>병원 관리</h2>
            <ul>
                <li><Link to="/companies">📋 병원 목록</Link></li>
                <li><Link to="/create">➕ 새 병원 생성</Link></li>
            </ul>
        </div>
    );
};

export default Home;
