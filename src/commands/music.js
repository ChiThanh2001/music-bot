const { SlashCommandBuilder } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  AudioPlayer,
  VoiceConnectionStatus,
} = require("@discordjs/voice");
const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");
const player = createAudioPlayer();
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("play a music")
    .addStringOption((option) =>
      option
        .setName("music_name")
        .setDescription("The name of music")
        .setRequired(true)
    ),
  async execute(interaction) {
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

    await interaction.deferReply();

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: false,
    });

    const getConnection = getVoiceConnection(interaction.guildId);
    const memberOfVoiceChannel = interaction.member.voice.channel.members.size;

    // console.log(humanMember[0].guild.name);
    const songName = interaction.options.getString("music_name");
    connection.subscribe(player);

    connection.on(VoiceConnectionStatus.Ready, () => {
      console.log(
        "The connection has entered the Ready state - ready to play audio!"
      );
    });

    connection.on(
      VoiceConnectionStatus.Disconnected,
      async (oldState, newState) => {
        try {
          await Promise.race([
            entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
            entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
          ]);
          // Seems to be reconnecting to a new channel - ignore disconnect
        } catch (error) {
          // Seems to be a real disconnect which SHOULDN'T be recovered from
          connection.destroy();
        }
      }
    );

    const search = await ytSearch(songName);
    const urlSearch = search.videos[0].url;

    const ytdlProcess = ytdl(urlSearch, { filter: "audioonly" });

    ytdlProcess.on("error", (error) => console.error(error));

    const resource = createAudioResource(ytdlProcess);

    player.play(resource);

    player.on("error", (error) => {
      console.error(
        `Error: ${error.message} with resource ${error.resource.metadata.title}`
      );
      player.play(getNextResource());
    });

    return interaction.editReply({ content: `Played ${urlSearch}` });

    // if (subscription) {
    //   // Unsubscribe after 5 seconds (stop playing audio on the voice connection)
    //   console.log(1);
    // }
  },
};
