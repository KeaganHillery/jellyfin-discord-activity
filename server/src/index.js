import express from "express";

const app = express();

const PORT = 3000;
const JELLYFIN_URL = process.env.JELLYFIN_URL;
const JELLYFIN_API_KEY = process.env.JELLYFIN_API_KEY;

if (!JELLYFIN_URL) {
  throw new Error("JELLYFIN_URL is missing");
}

if (!JELLYFIN_API_KEY) {
  throw new Error("JELLYFIN_API_KEY is missing");
}

const jellyfinHeaders = {
  "X-Emby-Token": JELLYFIN_API_KEY
};

app.get("/health", (req, res) => {
  res.json({
    status: "ok"
  });
});

app.get("/api/movies", async (req, res) => {
  try {
    const response = await fetch(
      `${JELLYFIN_URL}/Items?Recursive=true&IncludeItemTypes=Movie&Fields=PrimaryImageAspectRatio,Overview,Genres,RunTimeTicks,ProductionYear,OfficialRating`,
      {
        headers: jellyfinHeaders
      }
    );

    if (!response.ok) {
      throw new Error(`Jellyfin returned HTTP ${response.status}`);
    }

    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error("Jellyfin movie request failed:", error);

    res.status(500).json({
      error: "Failed to retrieve movies from Jellyfin"
    });
  }
});

app.get("/api/movies/:id/image", async (req, res) => {
  try {
    const movieId = req.params.id;

    const response = await fetch(
      `${JELLYFIN_URL}/Items/${encodeURIComponent(movieId)}/Images/Primary`,
      {
        headers: jellyfinHeaders
      }
    );

    if (!response.ok) {
      res.status(response.status).send("Image unavailable");
      return;
    }

    const contentType = response.headers.get("content-type");

    if (contentType) {
      res.set("Content-Type", contentType);
    }

    res.set("Cache-Control", "public, max-age=3600");

    const imageBuffer = Buffer.from(await response.arrayBuffer());

    res.send(imageBuffer);
  } catch (error) {
    console.error("Jellyfin image request failed:", error);

    res.status(500).send("Failed to retrieve image");
  }
});

/*
 * Jellyfin video streaming proxy.
 *
 * The Activity never receives the Jellyfin API key.
 * The backend authenticates with Jellyfin and forwards the
 * video response to the Activity.
 */
app.get("/api/movies/:id/stream", async (req, res) => {
  try {
    const movieId = req.params.id;

    const jellyfinUrl =
      `${JELLYFIN_URL}/Videos/${encodeURIComponent(movieId)}/stream` +
      `?static=true`;

    const headers = {
      "X-Emby-Token": JELLYFIN_API_KEY
    };

    if (req.headers.range) {
      headers.Range = req.headers.range;
    }

    const response = await fetch(jellyfinUrl, {
      headers
    });

    if (!response.ok && response.status !== 206) {
      console.error(
        `Jellyfin stream returned HTTP ${response.status}`
      );

      res.status(response.status).send("Unable to stream video");
      return;
    }

    res.status(response.status);

    const headersToForward = [
      "content-type",
      "content-length",
      "content-range",
      "accept-ranges"
    ];

    for (const header of headersToForward) {
      const value = response.headers.get(header);

      if (value) {
        res.set(header, value);
      }
    }

    res.set("Cache-Control", "no-cache");

    if (!response.body) {
      res.end();
      return;
    }

    for await (const chunk of response.body) {
      res.write(chunk);
    }

    res.end();

  } catch (error) {
    console.error("Jellyfin streaming failed:", error);

    if (!res.headersSent) {
      res.status(500).send("Failed to stream video");
    } else {
      res.end();
    }
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Watch Party server listening on port ${PORT}`);
});
