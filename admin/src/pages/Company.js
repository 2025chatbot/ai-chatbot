import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Chat from '../components/Chat';

const Company = () => {
    const { companyname } = useParams();
    const [open, setOpen] = useState(false);

    const toggleChat = () => {
        setOpen((prev) => !prev);
    };

    return (
        <>
            <div style={{ padding: '2rem' }}>
                <h1>{companyname} 페이지입니다</h1>
                <p>오른쪽 아래 💬 버튼을 클릭하면 채팅창이 열립니다.</p>
            </div>

            {/* 💬 고정 버튼 */}
            <div
                onClick={toggleChat}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    width: '50px',
                    height: '50px',
                    backgroundColor: '#007bff',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '24px',
                    cursor: 'pointer',
                    zIndex: 1000,
                }}
            >
                💬
            </div>

            {/* 📦 채팅창 */}
            {open && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '80px',
                        right: '20px',
                        width: '350px',
                        height: '500px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                        zIndex: 1000,
                        backgroundColor: '#fff',
                    }}
                >
                    <Chat chatid={companyname} />
                </div>
            )}
        </>
    );
};

export default Company;