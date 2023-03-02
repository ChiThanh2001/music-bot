function isYoutubeUrl(url) {
  // YouTube URL pattern regex
  const youtubeUrlPattern =
    /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/;

  // Match URL against YouTube URL pattern
  return youtubeUrlPattern.test(url);
}

module.exports = { isYoutubeUrl };
