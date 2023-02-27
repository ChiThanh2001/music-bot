const { Client, GatewayIntentBits } = require("discord.js");
const loadingCommand = require("./loading-command");
const { token } = require("./config.json");
const collection = require("./collection");
const test = require("./events/interactionCreate");
const path = require("node:path");
const fs = require("node:fs");
// const ytdl = require("ytdl-core");
// const fetch = require("node-fetch-npm");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.commands = collection;

client.once("ready", (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

loadingCommand();

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}
client.login(token);
