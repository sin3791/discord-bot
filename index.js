require("dotenv").config();

const { Client, Events, GatewayIntentBits } = require("discord.js");

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

client.on(Events.MessageCreate, (message) => {
  // 봇이 보낸 메시지는 무시한다.
  if (message.author.bot) return;

  console.log(`${message.author.username}: ${message.content}`);

  if (message.content === "안녕") {
    message.reply("안녕하세요!");
  }
});

client.login(process.env.DISCORD_TOKEN);