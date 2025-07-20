import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import ChatWidget from './components/ChatWidget';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
});

// 전역에서 위젯을 초기화하는 함수
window.initChatbot = (config = {}) => {
  // 설정 저장
  window.CHATBOT_CONFIG = {
    companyName: 'default',
    title: '고객 상담',
    serverUrl: 'http://localhost:3000',
    ...config
  };

  // 위젯 컨테이너 생성
  let container = document.getElementById('chatbot-widget-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'chatbot-widget-container';
    document.body.appendChild(container);
  }

  // React 앱 마운트
  const root = createRoot(container);
  root.render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ChatWidget />
    </ThemeProvider>
  );
};

// 자동 초기화 (개발용)
if (process.env.NODE_ENV === 'development') {
  window.initChatbot({
    companyName: 'apple',
    title: '애플 고객 상담',
  });
}
