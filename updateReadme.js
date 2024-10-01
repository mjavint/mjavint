const axios = require("axios");
const fs = require("fs/promises");
require("dotenv").config();

// Configuración de la API de YouTube
const API_KEY = process.env.YOUTUBE_API_KEY; // Asegúrate de configurar la clave en un archivo .env
const CHANNEL_ID = "UCiW5srrb8AnxyHeJyZbspbA"; // ID del canal de YouTube de DevTool School

async function getLatestVideos() {
  if (!API_KEY) {
    console.error("ERROR: La clave de la API de YouTube no está configurada.");
    return [];
  }

  const youtubeApiUrl = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet&order=date&maxResults=6&type=video`;

  try {
    const response = await axios.get(youtubeApiUrl);
    const videos = response.data.items.map((item) => ({
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      thumbnail: item.snippet.thumbnails.medium.url,
    }));

    return videos;
  } catch (error) {
    console.error("Error fetching latest videos:", error);
    return [];
  }
}

function generateYoutubeCards(videos) {
  let youtubeCards = "";
  videos.forEach((video) => {
    youtubeCards += `[![${video.title}](${video.thumbnail})](${video.url})\n\n`;
  });
  return youtubeCards;
}

async function updateReadme(youtubeCards) {
  try {
    const readmeContent = await fs.readFile("README.md", "utf8");

    const updatedContent = readmeContent.replace(
      /<!-- BEGIN YOUTUBE-CARDS -->.*<!-- END YOUTUBE-CARDS -->/s,
      `<!-- BEGIN YOUTUBE-CARDS -->\n${youtubeCards}<!-- END YOUTUBE-CARDS -->`
    );

    await fs.writeFile("README.md", updatedContent);
    console.log("README.md actualizado con éxito.");
  } catch (error) {
    console.error("Ocurrió un error al actualizar el README.md:", error);
  }
}

async function main() {
  try {
    const videos = await getLatestVideos();
    if (videos.length > 0) {
      const youtubeCards = generateYoutubeCards(videos);
      await updateReadme(youtubeCards);
    } else {
      console.log("No se pudieron obtener videos del canal de YouTube.");
    }
  } catch (error) {
    console.error("Ocurrió un error:", error);
  }
}

main();
