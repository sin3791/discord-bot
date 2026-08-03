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

## 배포 주소

https://discord-bot-syeb.onrender.com

## 배포 환경

- Render Web Service Free
- Node.js / Express
- React / Vite
- Socket.IO
- Discord.js
- DeepL API

## 배포 환경변수

- DISCORD_TOKEN
- DISCORD_CHANNEL_ID
- DEEPL_API_KEY

환경변수의 실제 값은 GitHub에 업로드하지 않습니다.

## 참고사항

Render 무료 서버는 일정 시간 요청이 없으면 자동으로 중지됩니다.
첫 접속 시 서버가 시작되기까지 약 1분이 걸릴 수 있습니다.


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






