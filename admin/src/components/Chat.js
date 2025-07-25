import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Stack,
    Paper,
    TextField,
    IconButton,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const Chat = ({ chatid }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const bottomRef = useRef(null); // ✅ 스크롤 대상

    const sendMessage = async () => {
        if (!input.trim()) return;

        const newUserMessage = { role: 'user', content: input };
        setMessages((prev) => [...prev, newUserMessage]);
        setInput('');

        try {
            const response = await fetch(`http://localhost:3000/Query/${chatid}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input }),
            });

            const data = await response.json();
            const botMessage = { role: 'bot', content: data.content };
            setMessages((prev) => [...prev, botMessage.content]);
        } catch (err) {
            console.error('Message send failed:', err);
        }
    };

    // ✅ 스크롤 항상 아래로
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    return (
        <Box display="flex" flexDirection="column" height="100%">
            <Box flex={1} overflow="auto" p={2}>
                <Stack spacing={1}>
                    {messages.map((msg, idx) => (
                        <Box
                            key={idx}
                            display="flex"
                            justifyContent={msg.role === 'user' ? 'flex-end' : 'flex-start'}
                        >
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 1.5,
                                    maxWidth: '75%',
                                    backgroundColor: msg.role === 'user' ? '#d1e7ff' : '#f0f0f0',
                                    color: '#333',
                                    borderRadius: 5,
                                }}
                            >
                                {typeof msg.content === 'object'
                                    ? JSON.stringify(msg.content, null, 2)
                                    : msg.content}
                            </Paper>
                        </Box>
                    ))}
                    <div ref={bottomRef} /> {/* ✅ 스크롤 anchor */}
                </Stack>
            </Box>

            <Box
                display="flex"
                borderTop="1px solid #ccc"
                px={2}
                py={1}
                component="form"
                onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                }}
            >
                <TextField
                    fullWidth
                    variant="standard"
                    placeholder="메시지를 입력하세요"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    sx={{ mr: 1 }}
                />
                <IconButton type="submit" color="primary">
                    <SendIcon />
                </IconButton>
            </Box>
        </Box>
    );
};

export default Chat;
