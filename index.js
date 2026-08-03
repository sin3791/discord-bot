require("dotenv").config({ quiet: true });

const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const {
  Client,
  Events,
  GatewayIntentBits,
} = require("discord.js");

const deepl = require("deepl-node");

const PORT = process.env.PORT || 3000;
const MAX_MESSAGE_LENGTH = 1000;

const DISCORD_CHANNEL_ID =
  process.env.DISCORD_CHANNEL_ID;

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const translator = new deepl.DeepLClient(
  process.env.DEEPL_API_KEY
);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

/*
 * 웹 서버 확인용 주소
 * http://localhost:3000으로 접속하면 확인할 수 있습니다.
 */
app.get("/api/health", (request, response) => {
  response.json({ ok: true });
});

const clientDistPath = path.join(__dirname, "client", "dist");

app.use(express.static(clientDistPath));

app.get("/{*splat}", (request, response) => {
  response.sendFile(path.join(clientDistPath, "index.html"));
});

/*
 * React 웹사이트 연결
 */
io.on("connection", (socket) => {
  console.log("웹사이트 연결:", socket.id);

  /*
   * 웹사이트 한국어
   * → 일본어 번역
   * → Discord 전송
   * → 웹사이트에 번역 결과 표시
   */
  socket.on("chat:send", async (data, callback) => {
    const originalText =
      typeof data?.text === "string"
        ? data.text.trim()
        : "";

    if (!originalText) {
      callback({
        ok: false,
        error: "번역할 메시지를 입력해주세요.",
      });
      return;
    }

    if (originalText.length > MAX_MESSAGE_LENGTH) {
      callback({
        ok: false,
        error: `메시지는 ${MAX_MESSAGE_LENGTH}자까지 입력할 수 있습니다.`,
      });
      return;
    }

    console.log("웹사이트 메시지:", originalText);

    try {
      if (!DISCORD_CHANNEL_ID) {
        throw new Error(
          "DISCORD_CHANNEL_ID가 설정되지 않았습니다."
        );
      }

      const result = await translator.translateText(
        originalText,
        null,
        "ja"
      );

      const channel = await client.channels.fetch(
        DISCORD_CHANNEL_ID
      );

      if (
        !channel?.isTextBased() ||
        typeof channel.send !== "function"
      ) {
        throw new Error(
          "Discord 텍스트 채널을 찾을 수 없습니다."
        );
      }

      await channel.send(
        `🌐 **웹 사용자**\n🇯🇵 ${result.text}`
      );

      const translatedMessage = {
        id: Date.now(),
        source: "web",
        author: "웹 사용자",
        original: originalText,
        translated: result.text,
      };

      io.emit(
        "chat:message",
        translatedMessage
      );

      callback({
        ok: true,
      });
    } catch (error) {
      console.error(
        "웹사이트 전송 오류:",
        error
      );

      callback({
        ok: false,
        error:
          "메시지를 번역하거나 전송하지 못했습니다.",
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(
      "웹사이트 연결 종료:",
      socket.id
    );
  });
});

/*
 * Discord 봇 로그인 완료
 */
client.once(
  Events.ClientReady,
  (readyClient) => {
    console.log(
      `${readyClient.user.tag} 로그인 성공!`
    );
  }
);

/*
 * Discord 메시지 자동 번역
 *
 * 한국어 → 일본어
 * 일본어 → 한국어
 *
 * 번역 결과를 Discord와 웹사이트에 모두 표시합니다.
 */
client.on(
  Events.MessageCreate,
  async (message) => {
    /*
     * 봇이 보낸 메시지를 다시 처리하지 않습니다.
     * 무한 반복 방지 코드입니다.
     */
    if (message.author.bot) {
      return;
    }

    /*
     * .env에서 지정한 채널만 처리합니다.
     */
    if (
      message.channelId !==
      DISCORD_CHANNEL_ID
    ) {
      return;
    }

    /*
     * !번역을 붙여도 되고 일반 메시지를 작성해도 됩니다.
     */
    const originalText = message.content
      .replace(/^!번역\s*/, "")
      .trim();

    if (!originalText) {
      return;
    }

    if (
      originalText.length >
      MAX_MESSAGE_LENGTH
    ) {
      await message.reply(
        `메시지는 ${MAX_MESSAGE_LENGTH}자까지 입력할 수 있습니다.`
      );
      return;
    }

    /*
     * 한글 포함 여부로 번역 방향을 결정합니다.
     */
    const containsKorean =
      /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(
        originalText
      );

    const targetLanguage =
      containsKorean ? "ja" : "ko";

    const targetFlag =
      containsKorean ? "🇯🇵" : "🇰🇷";

    console.log(
      `Discord 메시지: ${message.author.username}: ${originalText}`
    );

    try {
      const result =
        await translator.translateText(
          originalText,
          null,
          targetLanguage
        );

      /*
       * Discord에 번역 결과 답변
       */
      await message.reply(
        `${targetFlag} ${result.text}`
      );

      /*
       * React 웹사이트로 실시간 전달
       */
      const translatedMessage = {
        id: message.id,
        source: "discord",
        author:
          message.member?.displayName ||
          message.author.username,
        original: originalText,
        translated: result.text,
      };

      io.emit(
        "chat:message",
        translatedMessage
      );
    } catch (error) {
      console.error(
        "Discord 번역 오류:",
        error
      );

      await message.reply(
        "메시지를 번역하지 못했습니다."
      );

      io.emit(
        "chat:error",
        "Discord 메시지를 번역하지 못했습니다."
      );
    }
  }
);

/*
 * Express와 Socket.IO 서버 시작
 */
server.listen(PORT, () => {
  console.log(
    `웹 서버 실행 성공: http://localhost:${PORT}`
  );
});

/*
 * Discord 봇 로그인
 */
client
  .login(process.env.DISCORD_TOKEN)
  .catch((error) => {
    console.error(
      "Discord 로그인 오류:",
      error
    );
  });
