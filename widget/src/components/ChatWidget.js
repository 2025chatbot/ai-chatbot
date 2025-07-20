import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Stack,
    Paper,
    TextField,
    IconButton,
    Fab,
    Typography,
    Zoom
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const bottomRef = useRef(null);
    
    // 회사명은 전역 설정에서 가져오기
    const companyName = window.CHATBOT_CONFIG?.companyName || 'default';
    const chatid = `${companyName}:${Date.now()}`;
    
    const serverUrl = window.CHATBOT_CONFIG?.serverUrl || 'http://localhost:3000';

    const sendMessage = async () => {
        if (!input.trim()) return;

        const newUserMessage = { role: 'user', content: input };
        setMessages((prev) => [...prev, newUserMessage]);
        setInput('');

        try {
            const response = await fetch(`${serverUrl}/Query/${chatid}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input }),
            });

            const data = await response.json();
            
            let botContent = '';
            if (typeof data.content === 'string') {
                botContent = data.content;
            } else if (data.content && typeof data.content === 'object') {
                botContent = data.content.content || JSON.stringify(data.content);
            } else {
                botContent = '응답을 받을 수 없습니다.';
            }
            
            const botMessage = { role: 'bot', content: botContent };
            setMessages((prev) => [...prev, botMessage]);
        } catch (err) {
            console.error('Message send failed:', err);
            const errorMessage = { role: 'bot', content: '죄송합니다. 일시적인 오류가 발생했습니다.' };
            setMessages((prev) => [...prev, errorMessage]);
        }
    };

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    return (
        <>
            {/* 플로팅 챗봇 아이콘 */}
            <Zoom in={!isOpen}>
                <Fab
                    color="primary"
                    aria-label="chat"
                    onClick={() => setIsOpen(true)}
                    sx={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        zIndex: 9999,
                        // 🛡️ 최소한의 방어만 적용
                        fontSize: '16px',
                        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                    }}
                >
                    <ChatIcon sx={{ fontSize: '24px' }} />
                </Fab>
            </Zoom>

            {/* 플로팅 챗봇 대화창 */}
            {isOpen && (
                <Paper
                    elevation={8}
                    sx={{
                        position: 'fixed',
                        bottom: 90,
                        right: 24,
                        width: 400,
                        height: 600,
                        zIndex: 9999,
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        // 🛡️ 위젯 전체에 기본 보호 적용
                        fontSize: '20px',
                        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                        lineHeight: 1.5,
                        '& *': {
                            fontSize: 'inherit',
                            fontFamily: 'inherit',
                        }
                    }}
                >
                    {/* 헤더 */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 2,
                            borderBottom: '1px solid #e0e0e0',
                            backgroundColor: '#f5f5f5',
                        }}
                    >
                        <Typography variant="h6" sx={{ fontSize: '18px', fontWeight: 600 }}>
                            {window.CHATBOT_CONFIG?.title || '고객 상담'}
                        </Typography>
                        <IconButton onClick={() => setIsOpen(false)} size="large">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    
                    {/* 채팅 영역 */}
                    <Box flex={1} overflow="auto" p={2}>
                        <Stack spacing={1}>
                            {messages.length === 0 && (
                                <Box display="flex" justifyContent="flex-start">
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 1.5,
                                            maxWidth: '75%',
                                            backgroundColor: '#f0f0f0',
                                            color: '#333',
                                            borderRadius: 5,
                                            fontSize: '16px', // 🛡️ 명시적 크기 지정
                                        }}
                                    >
                                        안녕하세요! 무엇을 도와드릴까요?
                                    </Paper>
                                </Box>
                            )}
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
                                            fontSize: '16px', // 🛡️ 명시적 크기 지정
                                            lineHeight: 1.4,
                                        }}
                                    >
                                        {typeof msg.content === 'object'
                                            ? JSON.stringify(msg.content, null, 2)
                                            : msg.content}
                                    </Paper>
                                </Box>
                            ))}
                            <div ref={bottomRef} />
                        </Stack>
                    </Box>

                    {/* 입력 영역 */}
                    <Box
                        display="flex"
                        borderTop="1px solid #e0e0e0"
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
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                            sx={{ 
                                mr: 1,
                                fontSize: '16px', // 🛡️ 명시적 크기 지정
                                '& .MuiInputBase-input': {
                                    fontSize: '16px',
                                }
                            }}
                        />
                        <IconButton type="submit" color="primary" size="large">
                            <SendIcon />
                        </IconButton>
                    </Box>
                </Paper>
            )}
        </>
    );
};

export default ChatWidget;
