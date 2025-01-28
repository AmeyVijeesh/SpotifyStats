import { useEffect, useState } from 'react';
import SongSearchApp from './search';

const App = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [playlists, setPlaylists] = useState(null);
  const [playlistData, setPlaylistData] = useState(null);
  const [inputPlaylistId, setInputPlaylistId] = useState('');
  const [topTracks, setTopTracks] = useState(null);
  const [topArtists, setTopArtists] = useState(null);

  const handleLogin = () => {
    const clientId = '27a6dda3e48a4450b55d1eb826168cb3';
    const redirectUri = 'http://localhost:5173/';
    const scope = 'user-library-read playlist-read-private';
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=${scope}`;
    window.location.href = authUrl;
  };

  const handleLogout = () => {
    setUserProfile(null);
    setPlaylists(null);
    setAccessToken(null);
    window.location.hash = '';
    alert('You have been logged out! Please log in again.');
  };

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1));
    const token = params.get('access_token');
    const error = params.get('error');

    if (error) {
      console.error('Spotify login failed:', error);
      return;
    }

    if (token) {
      setAccessToken(token);
      fetchUserProfile(token);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch(
        `http://localhost:8000/user-profile?access_token=${token}`
      );
      const data = await response.json();
      setUserProfile(data.profile);
      setPlaylists(data.playlists.items);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const extractPlaylistId = (url) => {
    try {
      const urlObject = new URL(url);
      const pathname = urlObject.pathname; // Extract the path from the URL
      const segments = pathname.split('/'); // Split the path into segments

      // Handle the case for "https://open.spotify.com/playlist/{playlistId}"
      if (segments[1] === 'playlist' && segments[2]) {
        return segments[2]; // The playlist ID is the third segment
      }

      // Handle the case for "https://api.spotify.com/v1/playlists/{playlistId}/tracks"
      if (segments[2] === 'playlists' && segments[3]) {
        return segments[3]; // The playlist ID is the fourth segment
      }

      return null; // Return null if neither pattern matches
    } catch (error) {
      console.error('Error extracting playlist ID:', error);
      return null;
    }
  };

  const fetchPlaylistData = async (playlistId) => {
    const playlistIdExtracted = extractPlaylistId(playlistId);
    if (!playlistIdExtracted || !playlistIdExtracted.trim()) {
      alert('Please enter a valid playlist ID.');
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/get-playlist?playlist_id=${playlistIdExtracted}`
      );
      const data = await response.json();

      setPlaylistData(data.tracks.items);
      console.log(playlistData);
    } catch (error) {
      console.error('Error fetching playlist data:', error);
    }
  };

  const fetchTopItems = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/top-items?type=tracks`
      );
      const data = await response.json();
      setTopTracks(data.items);

      const response_a = await fetch(
        `http://localhost:8000/top-items?type=artists`
      );
      const data_a = await response_a.json();
      setTopArtists(data_a.items);
    } catch (error) {
      throw new Error(error);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Spotify App</h1>

      {!accessToken ? (
        <button
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#1DB954',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
          onClick={handleLogin}
        >
          Log in with Spotify
        </button>
      ) : (
        <div>
          <button
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: 'red',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginBottom: '20px',
            }}
            onClick={handleLogout}
          >
            Log out
          </button>

          <SongSearchApp access_token={accessToken} />

          {userProfile && (
            <div>
              <h2>Welcome, {userProfile.display_name}!</h2>
              <input
                type="text"
                placeholder="Enter Playlist ID"
                value={inputPlaylistId}
                onChange={(e) => setInputPlaylistId(e.target.value)}
              />
              <img src={userProfile.images[0].url} />
              <button
                onClick={() => {
                  console.log('id' + inputPlaylistId);
                  fetchPlaylistData(inputPlaylistId);
                }}
              >
                Fetch Playlist
              </button>
            </div>
          )}

          {playlists && (
            <div>
              <h2>List of Playlists: </h2>
              <ul>
                {playlists.map((playlist) => {
                  return (
                    <div key={playlist.id}>
                      <li>{playlist.name}</li>
                      <button
                        onClick={() => {
                          fetchPlaylistData(playlist.tracks.href);
                        }}
                      >
                        View Songs
                      </button>
                    </div>
                  );
                })}
              </ul>
            </div>
          )}

          <button
            onClick={() => {
              fetchTopItems();
            }}
          >
            Fetch Top Tracks
          </button>

          {topTracks && (
            <div>
              <h3>Top Tracks: </h3>
              <ul>
                {topTracks.map((topTrack) => {
                  return (
                    <li key={topTrack.id}>
                      {topTrack.name} -{' '}
                      {topTrack.artists.map((artist) => artist.name).join(', ')}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {topArtists && (
            <div>
              <h3>Top Artists: </h3>
              <ul>
                {topArtists.map((topArtist) => {
                  return <li key={topArtist.id}>{topArtist.name} </li>;
                })}
              </ul>
            </div>
          )}

          {playlistData && (
            <div>
              <h3>Playlist Tracks:</h3>
              <ul>
                {playlistData.map((track) => (
                  <li key={track.id}>
                    {track.track.name} -{' '}
                    {track.track.artists
                      .map((artist) => artist.name)
                      .join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
