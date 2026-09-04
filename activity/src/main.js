import { DiscordSDK } from "@discord/embedded-app-sdk";

const CLIENT_ID = "1545490994575966259";

const discordSdk = new DiscordSDK(CLIENT_ID);

const status = document.getElementById("status");
const moviesContainer = document.getElementById("movies");

let movies = [];

function showLibrary() {
  status.textContent = `${movies.length} movies available`;

  moviesContainer.innerHTML = "";

  for (const movie of movies) {
    const card = document.createElement("div");
    card.className = "movie";

    const image = document.createElement("img");
    image.className = "poster";
    image.alt = movie.Name;
    image.src = `/api/movies/${movie.Id}/image`;

    const info = document.createElement("div");
    info.className = "movie-info";

    const title = document.createElement("div");
    title.className = "movie-title";
    title.textContent = movie.Name;

    const year = document.createElement("div");
    year.className = "movie-year";
    year.textContent = movie.ProductionYear || "";

    info.appendChild(title);
    info.appendChild(year);

    card.appendChild(image);
    card.appendChild(info);

    card.addEventListener("click", () => {
      showMovie(movie);
    });

    moviesContainer.appendChild(card);
  }
}

function showMovie(movie) {
  status.textContent = "Movie details";

  moviesContainer.innerHTML = "";

  const details = document.createElement("div");
  details.className = "movie-details";

  const back = document.createElement("button");
  back.className = "back-button";
  back.textContent = "← Back to library";

  back.addEventListener("click", showLibrary);

  const content = document.createElement("div");
  content.className = "details-content";

  const poster = document.createElement("img");
  poster.className = "details-poster";
  poster.src = `/api/movies/${movie.Id}/image`;
  poster.alt = movie.Name;

  const information = document.createElement("div");
  information.className = "details-information";

  const title = document.createElement("h1");
  title.textContent = movie.Name;

  const metadata = document.createElement("div");
  metadata.className = "metadata";

  const metadataParts = [];

  if (movie.ProductionYear) {
    metadataParts.push(movie.ProductionYear);
  }

  if (movie.OfficialRating) {
    metadataParts.push(movie.OfficialRating);
  }

  if (movie.RunTimeTicks) {
    const minutes = Math.round(
      movie.RunTimeTicks / 600000000
    );

    metadataParts.push(`${minutes} min`);
  }

  metadata.textContent = metadataParts.join(" • ");

  const genres = document.createElement("div");
  genres.className = "genres";
  genres.textContent = movie.Genres?.join(" • ") || "";

  const overview = document.createElement("p");
  overview.className = "overview";
  overview.textContent =
    movie.Overview || "No description available.";

  const playButton = document.createElement("button");
  playButton.className = "play-button";
  playButton.textContent = "▶ Play";

  playButton.addEventListener("click", () => {
    showPlayer(movie);
  });

  information.appendChild(title);
  information.appendChild(metadata);
  information.appendChild(genres);
  information.appendChild(overview);
  information.appendChild(playButton);

  content.appendChild(poster);
  content.appendChild(information);

  details.appendChild(back);
  details.appendChild(content);

  moviesContainer.appendChild(details);
}

function showPlayer(movie) {
  status.textContent = `Playing: ${movie.Name}`;

  moviesContainer.innerHTML = "";

  const playerContainer = document.createElement("div");
  playerContainer.className = "player-container";

  const back = document.createElement("button");
  back.className = "back-button";
  back.textContent = "← Back";

  back.addEventListener("click", () => {
    showMovie(movie);
  });

  const video = document.createElement("video");

  video.className = "video-player";

  video.controls = true;
  video.autoplay = true;
  video.playsInline = true;

  video.src = `/api/movies/${movie.Id}/stream`;

  video.addEventListener("loadedmetadata", () => {
    console.log("Video metadata loaded");
  });

  video.addEventListener("playing", () => {
    status.textContent = `Playing: ${movie.Name}`;
  });

  video.addEventListener("pause", () => {
    status.textContent = `Paused: ${movie.Name}`;
  });

  video.addEventListener("error", () => {
    console.error("Video error:", video.error);

    status.textContent = "Unable to play this movie.";
  });

  playerContainer.appendChild(back);
  playerContainer.appendChild(video);

  moviesContainer.appendChild(playerContainer);
}

async function loadMovies() {
  status.textContent = "Connecting to Jellyfin...";

  try {
    const response = await fetch("/api/movies");

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data.Items || !Array.isArray(data.Items)) {
      throw new Error("Invalid Jellyfin response");
    }

    movies = data.Items;

    showLibrary();

  } catch (error) {
    console.error("Jellyfin error:", error);

    status.textContent =
      `Jellyfin error: ${error.message}`;

    moviesContainer.innerHTML = `
      <div class="error">
        <h2>Could not load Jellyfin</h2>
        <p>${error.message}</p>
      </div>
    `;
  }
}

async function start() {
  try {
    status.textContent = "Connecting to Discord...";

    await discordSdk.ready();

    console.log("Discord Activity ready");

    await loadMovies();

  } catch (error) {
    console.error("Discord Activity error:", error);

    status.textContent =
      `Discord error: ${error.message}`;
  }
}

start();
