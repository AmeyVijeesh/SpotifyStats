import { useEffect, useState } from 'react';
import Search from './components/search.jsx';
import FetchTopItems from './components/fetchTopItems.jsx';
import Landing from './components/landingPage.jsx';
import Profile from './components/profile.jsx';
import Modal from 'react-modal';
import Playlists from './components/playlists.jsx';

const App = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [playlists, setPlaylists] = useState(null);
  const [playlistData, setPlaylistData] = useState(null);
  const [inputPlaylistId, setInputPlaylistId] = useState('');
  const [topTracks, setTopTracks] = useState(null);
  const [topArtists, setTopArtists] = useState(null);
  const [noPlaylists, setNoPlaylists] = useState(0);
  const [playlistImg, setPlaylistImg] = useState(null);

  const handleLogin = () => {
    const clientId = 'c9e9abc6c49c44abb0e02bd049165d92';
    console.log('id' + clientId);
    const redirectUri = 'https://getspotifyinfo.netlify.app/';
    const scope = 'user-library-read playlist-read-private';
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=${scope}`;
    window.location.href = authUrl;
  };

  const handleLogout = () => {
    setUserProfile(null);
    setPlaylists(null);
    setAccessToken(null);
    setTopArtists(null);
    setTopTracks(null);
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
        `https://spotifystats-fn9u.onrender.com/user-profile?access_token=${token}`
      );
      const data = await response.json();

      if (data.profile) setUserProfile(data.profile);

      if (data.playlists?.items) {
        const playlistCount = data.playlists.items.length;
        setPlaylists(data.playlists.items);
        setNoPlaylists(playlistCount);
        console.log(`Number of playlists: ${playlistCount}`);
      } else {
        setNoPlaylists(0); // Fallback if there are no playlists
        console.log('No playlists found.');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const extractPlaylistId = (url) => {
    try {
      const urlObject = new URL(url);
      const pathname = urlObject.pathname;
      const segments = pathname.split('/');

      if (segments[1] === 'playlist' && segments[2]) {
        return segments[2];
      }

      if (segments[2] === 'playlists' && segments[3]) {
        return segments[3];
      }

      return null;
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
        `https://spotifystats-fn9u.onrender.com/get-playlist?playlist_id=${playlistIdExtracted}`
      );
      const data = await response.json();

      setPlaylistData(data.tracks.items);
      setPlaylistImg(data.images[0]?.url);
      console.log(playlistData);
    } catch (error) {
      console.error('Error fetching playlist data:', error);
    }
  };

  return (
    <div>
      {!accessToken ? (
        <Landing btnOnClick={handleLogin} />
      ) : (
        <div style={{ width: '100%' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Profile
              details={userProfile}
              playlistCount={noPlaylists}
              logOut={handleLogout}
            />
          </div>
          <div>
            <Search access_token={accessToken} />{' '}
          </div>

          <Playlists
            playlists={playlists}
            extractor={extractPlaylistId}
            at={accessToken}
          />

          <div className="searchContainer">
            <h2 className="searchHeader">Fetch a Playlist</h2>
            <input
              type="text"
              placeholder="Enter Playlist ID"
              value={inputPlaylistId}
              className="searchInput"
              onChange={(e) => setInputPlaylistId(e.target.value)}
            />
            <button
              onClick={() => {
                console.log('id' + inputPlaylistId);
                fetchPlaylistData(inputPlaylistId);
              }}
              className="searchBtn"
            >
              Fetch Playlist
            </button>
          </div>
          {playlistData && (
            <div className="playlistContainer">
              <img src={playlistImg} />
              <h3 className="searchHeader">Playlist Tracks:</h3>
              <ol>
                {playlistData.map((track) => (
                  <li key={track.id} className="playlistLi">
                    {track.track.name} -{' '}
                    {track.track.artists
                      .map((artist) => artist.name)
                      .join(', ')}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
      <FetchTopItems access_token={accessToken} />
    </div>
  );
};

export default App;
