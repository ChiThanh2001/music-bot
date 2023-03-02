// function to check whether input is valid
function isValidUrl(userInput) {
  try {
    const parsedUrl = new URL(userInput);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch (err) {
    return false;
  }
}

module.exports = { isValidUrl };
