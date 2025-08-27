import "dotenv/config";

//interfaces for type checking

interface Artist {
  name: string;
}
interface Album {
  name: string;
}
interface Track {
  name: string;
  artists: Artist[];
  album: Album;
  external_urls: {
    spotify: string;
  };
}
interface TracksResponse {
  tracks: {
    items: Track[];
    total: number;
  };
}

// AUTHENTICATION
async function getAccessToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  //Null checks
  if (!clientId) throw new Error("SPOTIFY_CLIENT_ID not defined");
  if (!clientSecret) throw new Error("SPOTIFY_CLIENT_SECRET not defined");

  const token = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data: { access_token: string } = await res.json();
  return data.access_token;
}

//FETCH DATA
async function main() {
  const keyword = process.argv[2];
  if (!keyword) {
    console.error("Please provide a search keyword!");
    process.exit(1);
  }

  const token = await getAccessToken();
  const result = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      keyword
    )}&type=track&limit=6`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const data: TracksResponse = await result.json();
  if (data.tracks && data.tracks.items.length > 0) {
    console.log("\n===> Searching on Spotify . . .\n");
    console.log("=".repeat(40));
    console.log(`🎵 Top 5 tracks for "${keyword}":`);
    console.log("=".repeat(40) + "\n");
    data.tracks.items.forEach((track: any, index: number) => {
      console.log(
        `${index + 1}. 🎵 ${track.name}
   👤 Artist(s): ${track.artists.map((a: any) => a.name).join(", ")}
   💿 Album: ${track.album.name}
   🔗 Link: ${track.external_urls.spotify}\n`
      );
    });
    console.log("\n");
  } else {
    console.log("No tracks found.");
  }
}
main();
