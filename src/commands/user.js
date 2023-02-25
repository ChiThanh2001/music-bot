const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("user")
    .setDescription("Replies with name!"),
  async execute(interaction) {
    await interaction.reply("name!");
  },
};
