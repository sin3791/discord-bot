require("dotenv").config();

const { Client, Events, GatewayIntentBits } = require("discord.js");
const deepl = require("deepl-node");

const translator = new deepl.DeepLClient(process.env.DEEPL_API_KEY);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`${readyClient.user.tag} 로그인 성공!`);
});

client.on(Events.MessageCreate, async (message) => {
  // 봇이 보낸 메시지는 무시
  if (message.author.bot) return;

  console.log(`${message.author.username}: ${message.content}`);

  // "!번역 "으로 시작하는 메시지만 처리
  if (!message.content.startsWith("!번역 ")) return;

  const originalText = message.content.slice(4).trim();

  if (!originalText) {
    await message.reply("번역할 문장을 입력해주세요.");
    return;
  }

  try {
    // 원문 언어 자동 감지 → 일본어 번역
    const result = await translator.translateText(
      originalText,
      null,
      "ja"
    );

    await message.reply(`🇯🇵 ${result.text}`);
  } catch (error) {
    console.error("번역 오류:", error);
    await message.reply("번역 중 오류가 발생했습니다.");
  }
});

client.login(process.env.DISCORD_TOKEN);