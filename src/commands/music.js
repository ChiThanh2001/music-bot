const { SlashCommandBuilder } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayer,
} = require("@discordjs/voice");
const ytdl = require("ytdl-core");
const audioPlayer = new AudioPlayer();
module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("play a music")
    .addStringOption((option) =>
      option.setName("music_name").setDescription("The name of music")
    ),
  async execute(interaction) {
    const songName = interaction.options.getString("music_name");
    console.log(songName);
    const voiceChannel = interaction.member.voice.channel;
    const locales = {
      vi: "Bạn phải ở trong phòng voice để có thể sử dụng câu lệnh này",
      "en-US": "You must in a voice channel to use this slash command",
    };
    const member = interaction.member;
    if (!member.voice.channel) {
      interaction.reply(locales[interaction.locale]);
      return;
    }
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });
    // const stream = ytdl.filterFormats(songName, { filter: "audioonly" });
    // const resource = createAudioResource(stream);
    // const player = createAudioPlayer();
  },
};
