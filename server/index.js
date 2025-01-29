import express from 'express';
import querystring from 'querystring';
import axios from 'axios';
import CORS from 'cors';
import { error } from 'console';

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URL = process.env.REDIRECT_URL;

const app = express();

let accessToken = null;
let refreshToken = null;

app.use(CORS());

app.get('/', (req, res) => {
  res.json('Server is up and running!');
});

app.get('/login', (req, res) => {
  const scopes = 'playlist-read-private user-top-read';
  const spotifyAuthUrl =
    'https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: CLIENT_ID,
      scope: scopes,
      redirect_uri: REDIRECT_URL,
    });

  console.log('Redirect URI:', REDIRECT_URL);
  console.log('Spotify Auth URL:', spotifyAuthUrl);
  res.redirect(spotifyAuthUrl);
});

app.get('/callback', async (req, res) => {
  const authCode = req.query.code;

  if (!authCode) {
    return res.redirect('http://localhost:8000/login');
  }

  try {
    const tokenResponse = await axios.post(
      'https://accounts.spotify.com/api/token',
      querystring.stringify({
        grant_type: 'authorization_code',
        code: authCode,
        redirect_uri: REDIRECT_URL,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    accessToken = tokenResponse.data.access_token;
    refreshToken = tokenResponse.data.refresh_token;

    return res.redirect('/user-profile');
  } catch (error) {
    console.error(
      'Error getting token:',
      error.response?.data || error.message
    );
    return res.status(500).send('Failed to get access token.');
  }
});

app.get('/user-profile', async (req, res) => {
  console.log(req.query);

  if (!accessToken) {
    return res.redirect('/login');
  }

  try {
    const profileResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const playlists = await axios.get(
      'https://api.spotify.com/v1/me/playlists',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const playlist1 = await axios.get(
      `https://api.spotify.com/v1/playlists/0SpANXPDG88ADjMnOwHWdh/tracks`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return res.json({
      profile: profileResponse.data,
      playlists: playlists.data,
      playlist1: playlist1.data,
    });
  } catch (error) {
    console.error(
      'Error getting user profile:',
      error.response?.data || error.message
    );
    return res.status(500).send('Failed to get user profile.');
  }
});

app.get('/top-items', async (req, res) => {
  const { type } = req.query;

  if (!type || (type !== 'tracks' && type !== 'artists')) {
    return res
      .status(400)
      .send('Invalid type. Please use "tracks" or "artists".');
  }

  if (!accessToken) {
    return res.status(401).send('User not authenticated.');
  }

  try {
    const topItemsResponse = await axios.get(
      `https://api.spotify.com/v1/me/top/${type}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    res.status(200).json(topItemsResponse.data);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/get-playlist', async (req, res) => {
  const { playlist_id } = req.query;

  if (!playlist_id) {
    return res.status(400).send('Playlist ID is required');
  }

  if (!accessToken) {
    return res.status(401).send('User not authenticated');
  }

  try {
    const playlistResponse = await axios.get(
      `https://api.spotify.com/v1/playlists/${playlist_id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    res.json(playlistResponse.data);
  } catch (error) {
    console.error(
      'Error fetching playlist:',
      error.response?.data || error.message
    );
    res.status(500).send('Failed to fetch playlist.');
  }
});

app.get('/logout', (req, res) => {
  // Clear the server-side tokens
  accessToken = null;
  refreshToken = null;

  // Redirect the user to your own confirmation or login page
  res.redirect('/');
});

app.listen(8000, () => console.log('Listening on port 8000'));
