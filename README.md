# Discord 실시간 번역 채팅

React 웹사이트와 Discord 채널을 연결하여 한국어와 일본어를 실시간으로 번역하는 프로젝트입니다.

## 주요 기능

- 웹사이트 한국어 메시지를 일본어로 번역
- 번역된 일본어를 지정한 Discord 채널로 전송
- Discord 한국어 메시지를 일본어로 자동 번역
- Discord 일본어 메시지를 한국어로 자동 번역
- Discord 번역 결과를 React 웹사이트에 실시간 표시
- 봇 메시지 재처리 및 무한 반복 방지
- 빈 메시지와 1,000자 초과 메시지 제한

## 기술 스택

### Frontend

- React
- Vite
- Socket.IO Client

### Backend

- Node.js
- Express
- Socket.IO
- Discord.js
- DeepL Node SDK

## 프로젝트 구조

```text
discord-bot/
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   └── package.json
├── docs/
├── .env
├── .gitignore
├── index.js
├── package.json
└── README.md
