const {
  Client,
  GatewayIntentBits,
  Events,
  SlashCommandBuilder,
  REST,
  Routes,
} = require("discord.js");
const loadingCommand = require("./loading-command");
const { token, clientId, guildId } = require("./config.json");
const collection = require("./collection");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// client.commands = collection;

const slashCommand = {
  data: new SlashCommandBuilder().setName("test").setDescription("just test"),
  async execute(interaction) {
    await interaction.reply("ga");
  },
};

console.log(slashCommand.data);

const slashCommandData = slashCommand.data.toJSON();

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log(`Started refreshing application (/) commands.`);
    const data = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      {
        body: [slashCommandData],
      }
    );
    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    console.log(error);
  }
})();

client.on("ready", (c) => {
  console.log(`Bot ${c.user.tag} ready`);
});

client.on(Events.InteractionCreate, (interaction) => {
  slashCommand.execute(interaction);
});

// client.on("messageCreate", (msg) => {
//   console.log(msg.content);
// });

client.login(token);
