const axios = require("axios");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Define the paths for the data folder
const dataFolder = path.resolve(__dirname, "./data");

// Ensure the data folder exists
if (!fs.existsSync(dataFolder)) {
  fs.mkdirSync(dataFolder);
}

// URLs for instructions
const steamIdUrl = "https://steamdb.info/calculator/";
const accessTokenUrl =
  "https://store.steampowered.com/pointssummary/ajaxgetasyncconfig";

// Fetch environment variables
const accessToken = process.env.access_token;
const steamId = process.env.steamid;

// Check if access token and steam ID are set
if (!accessToken || !steamId) {
  console.error("Error: Missing access token or Steam ID.");
  console.log(`Please visit the following links to obtain your credentials:`);
  console.log(`- Steam ID: ${steamIdUrl}`);
  console.log(`- Access Token: ${accessTokenUrl}`);
  process.exit(1); // Exit the script with an error code
}

// URL to fetch the data from
const apiUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?access_token=${accessToken}&steamid=${steamId}&include_appinfo=true`;

// Paths for saving files
const apiResponseFilePath = path.join(dataFolder, "api_response.json");
const gamesModuleFilePath = path.join(dataFolder, "games_module.js");

// Function to fetch data and save as JSON
async function fetchData() {
  try {
    console.log("Fetching data from API...");
    const response = await axios.get(apiUrl);
    const data = response.data;

    fs.writeFileSync(
      apiResponseFilePath,
      JSON.stringify(data, null, 2),
      "utf8"
    );
    console.log(`Data fetched and saved to ${apiResponseFilePath}`);

    convertToJs(data);
  } catch (error) {
    console.error("Error fetching data:", error.message);
  }
}

// Function to convert JSON data to JS module
function convertToJs(data) {
  console.log("Converting data to JS module...");
  const transformedData = data.response.games.map((game) => ({
    id: game.appid,
    name: game.name,
  }));

  const jsModuleContent = `
module.exports = {
  games: ${JSON.stringify(transformedData, null, 2)}
};
`;

  fs.writeFileSync(gamesModuleFilePath, jsModuleContent, "utf8");
  console.log(`JS module saved to ${gamesModuleFilePath}`);
}

// Fetch data and convert to JS module
fetchData();
