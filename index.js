require("dotenv").config({ quiet: true });

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const {
  Client,
  Events,
  GatewayIntentBits,
} = require("discord.js");

const deepl = require("deepl-node");

const PORT = 3000;
const DISCORD_CHANNEL_ID =
  process.env.DISCORD_CHANNEL_ID;

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
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

app.get("/", (request, response) => {
  response.send("번역 서버가 실행 중입니다.");
});

io.on("connection", (socket) => {
  console.log("웹사이트 연결:", socket.id);

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

    console.log("웹사이트 메시지:", originalText);

    try {
      const result = await translator.translateText(
        originalText,
        null,
        "ja"
      );

      if (!DISCORD_CHANNEL_ID) {
        throw new Error(
          "DISCORD_CHANNEL_ID가 설정되지 않았습니다."
        );
      }

      const channel = await client.channels.fetch(
        DISCORD_CHANNEL_ID
      );

      if (!channel?.isTextBased()) {
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

      io.emit("chat:message", translatedMessage);

      callback({
        ok: true,
      });
    } catch (error) {
      console.error("웹사이트 전송 오류:", error);

      callback({
        ok: false,
        error: "메시지를 번역하거나 전송하지 못했습니다.",
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("웹사이트 연결 종료:", socket.id);
  });
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`${readyClient.user.tag} 로그인 성공!`);
  console.log("봇이 접근 가능한 텍스트 채널:");

  readyClient.channels.cache.forEach((channel) => {
    if (channel.isTextBased() && channel.name) {
      console.log(`#${channel.name}: ${channel.id}`);
    }
  });
});


client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) {
    return;
  }

  console.log(
    `${message.author.username}: ${message.content}`
  );

  if (!message.content.startsWith("!번역 ")) {
    return;
  }

  const originalText = message.content.slice(4).trim();

  if (!originalText) {
    await message.reply("번역할 문장을 입력해주세요.");
    return;
  }

  try {
    const result = await translator.translateText(
      originalText,
      null,
      "ja"
    );

    await message.reply(`🇯🇵 ${result.text}`);
  } catch (error) {
    console.error("Discord 번역 오류:", error);
    await message.reply("번역 중 오류가 발생했습니다.");
  }
});

server.listen(PORT, () => {
  console.log(
    `웹 서버 실행 성공: http://localhost:${PORT}`
  );
});

client.login(process.env.DISCORD_TOKEN);