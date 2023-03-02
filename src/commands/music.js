const { SlashCommandBuilder } = require("discord.js");

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  VoiceConnectionStatus,
  AudioPlayerStatus,
} = require("@discordjs/voice");

const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");

// function to check whether input is valid
function isValidUrl(userInput) {
  try {
    const parsedUrl = new URL(userInput);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch (err) {
    return false;
  }
}

function isYoutubeUrl(url) {
  // YouTube URL pattern regex
  const youtubeUrlPattern =
    /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/;

  // Match URL against YouTube URL pattern
  return youtubeUrlPattern.test(url);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("play a music")
    .addStringOption((option) =>
      option
        .setName("music_name")
        .setDescription("The name of music or url link")
        .setRequired(true)
    ),
  async execute(interaction) {
    const player = createAudioPlayer();
    // get the voice channel
    const voiceChannel = interaction.member.voice.channel;

    //the reply language of the bot depend on what country you are
    const locales = {
      vi: "Bạn phải ở trong phòng voice để có thể sử dụng câu lệnh này",
      "en-US": "You must in a voice channel to use this slash command",
    };

    //get the member
    const member = interaction.member;

    //check whether the member who used slash command in the voice channel
    if (!member.voice.channel) {
      interaction.reply(locales[interaction.locale]);
      return;
    }

    // because the interaction reply can take a long time so i use defer reply to wait the reply until it completed
    await interaction.deferReply();

    // join the voice channel
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: false,
    });

    //check if the voice connection ready to play audio or not
    connection.on(VoiceConnectionStatus.Ready, () => {
      console.log(
        "The connection has entered the Ready state - ready to play audio!"
      );
    });

    //check if the connection was really disconnected or not
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

    //subcribe player to connection so player can play audio
    connection.player = player;
    connection.subscribe(player);

    //get the song name
    const songName = interaction.options.getString("music_name");

    //check if the user's input is a url or not , if the user's input is url then do the if block code
    if (isValidUrl(songName)) {
      //check if the url was provided is valid url youtube or not
      if (isYoutubeUrl(songName)) {
        const ytdlProcess = ytdl(songName, {
          filter: "audioonly",
          highWaterMark: 1 << 25,
        });

        ytdlProcess.on("error", (error) => {
          console.error("process error: ", error);
          return interaction.reply(
            "Seem like your url you provided not a youtube domain"
          );
        });
        const resource = createAudioResource(ytdlProcess);

        connection.player.play(resource);

        player.on(AudioPlayerStatus.Playing, (oldState, newState) => {
          console.log("Audio player is in the Playing state!");
        });
        return interaction.editReply({ content: `Played ${songName}` });
      }

      //if the url is not valid then execute that code here
      return interaction.editReply(
        "Your url you provided is not a youtube URL , Please provide a valid youtube URL!"
      );
    }

    //if the user's input is a song name then do this code
    const search = await ytSearch(songName);
    const urlSearch = search.videos[0].url;

    const ytdlProcess = ytdl(urlSearch, {
      filter: "audioonly",
      highWaterMark: 1 << 25,
    });
    ytdlProcess.on("error", (error) => console.error("process error: ", error));
    const resource = createAudioResource(ytdlProcess);

    connection.player.play(resource);

    player.on(AudioPlayerStatus.Playing, (oldState, newState) => {
      console.log("Audio player is in the Playing state!");
    });

    player.on("error", (error) => {
      console.error(
        `Error resource: ${error.message} with resource ${error.resource.metadata.title}`
      );
    });

    return interaction.editReply({ content: `Played ${urlSearch}` });
  },
};
