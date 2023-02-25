const { Client, GatewayIntentBits, Events } = require("discord.js");
const loadingCommand = require("./loading-command");
const { token, clientId } = require("./config.json");
const collection = require("./collection");
const ytdl = require("ytdl-core");
const fetch = require("node-fetch-npm");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = collection;

client.once("ready", (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

loadingCommand();

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});

// const Guild = client.guilds.cache.get("GuildID"); // Getting the guild.

// const PREFIX = "!";

// client.on("interactionCreate", async (interaction) => {
//   if (!interaction.isChatInputCommand()) console.log(1);

//   console.log(2);
//   if (interaction.commandName === "ping") {
//     await interaction.reply("Pong!");
//   }
// });

// client.on("messageCreate", (message) => {
//   // Check if the message author is the bot
//   if (message.author.bot) return;

//   // Check if the message content is '!deletechannel'
//   if (message.content === "!deletechannel") {
//     // Check if the message author has permission to manage channels

//     // Delete the channel
//     message.channel
//       .delete()
//       .then((channel) => console.log(`Deleted channel ${channel.name}`))
//       .catch(console.error);
//   }
// });

// client.on("messageCreate", async (msg) => {
//   const voiceState = msg.guild.voiceStates.cache.get(msg.author.id);
//   const isVoiceChannel = voiceState?.channel?.name || null;
//   //   console.log(isVoiceChannel);
//   //   if (msg.member.guild.members.cache.get(msg.author.id).voice.channel) {
//   //     console.log(1);
//   //   }
//   //   const isVoiceChannel = msg.member.guild.members.cache.get(msg.author.id).voice
//   //     .channel.name;
//   //   console.log(isVoiceChannel);
//   const voiceChannel = msg.member.voice.channel;
//   //   const isVoiceChannel = voiceChannel ? voiceChannel.name : null;
//   //   console.log(voiceChannel);

//   const isCommand = msg.content.startsWith(PREFIX);
//   await msg.member.fetch();

//   if (!isCommand || msg.author.bot) return;
//   if (isCommand) {
//     const [cmdName, ...args] = msg.content.substring(1).split(" ");

//     // if (cmdName.toLowerCase() === "play") {
//     //   console.log(msg.member.voice.channel.members.size);
//     // }
//   }
// });

client.login(token);
