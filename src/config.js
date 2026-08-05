//config.js는 프로젝트 여러 곳에서 사용하는 환경변수와 공통 설정값을 모아두는 파일입니다.


// .env 파일의 환경변수를 process.env로 불러옵니다.
require("dotenv").config({ quiet: true });

// 프로젝트에서 사용할 환경변수와 공통 설정
const config = {
  // Render 환경에서는 지정된 포트를 사용하고,
  // 환경변수가 없으면 3000번 포트를 사용합니다.
  port: process.env.PORT || 3000,

  // 메시지 최대 입력 길이
  maxMessageLength: 1000,

  // Socket.IO 연결을 허용할 React 웹사이트 주소
  clientOrigin:
    process.env.CLIENT_ORIGIN ||
    "http://localhost:5173",

  // Discord 봇 로그인 토큰
  discordToken:
    process.env.DISCORD_TOKEN,

  // 번역 기능을 사용할 Discord 채널 ID
  discordChannelId:
    process.env.DISCORD_CHANNEL_ID,

  // DeepL 번역 API 키
  deeplApiKey:
    process.env.DEEPL_API_KEY,
};

// config 객체를 다른 파일에서 사용할 수 있도록 내보냅니다.
module.exports = config;