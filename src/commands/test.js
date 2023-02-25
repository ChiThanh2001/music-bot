const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("king")
    .setDescription("Replies with kong!"),
  async execute(interaction) {
    await interaction.reply("kong!");
  },
};
