import React, { useState } from 'react';

const Chat = ({ chatid }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    const sendMessage = async () => {
        if (!input.trim()) return;

        const newUserMessage = { role: 'user', content: input };
        setMessages((prev) => [...prev, newUserMessage]);
        setInput('');

        try {
            const response = await fetch(`http://localhost:3000/Query/${chatid}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input })
            });

            const data = await response.json();
            const botMessage = { role: 'bot', content: data.content };
            setMessages((prev) => [...prev, botMessage.content]);
        } catch (err) {
            console.error('Message send failed:', err);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        style={{
                            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            backgroundColor: msg.role === 'user' ? '#d1e7ff' : '#eee',
                            color: '#333',
                            margin: '5px',
                            padding: '10px',
                            borderRadius: '10px',
                            maxWidth: '80%'
                        }}
                    >
                        {typeof msg.content === 'object'
                            ? JSON.stringify(msg.content, null, 2)
                            : msg.content}
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', borderTop: '1px solid #ccc' }}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    style={{ flex: 1, padding: '10px', border: 'none', outline: 'none' }}
                />
                <button
                    onClick={sendMessage}
                    style={{ padding: '10px', border: 'none', backgroundColor: '#007bff', color: '#fff' }}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default Chat;
