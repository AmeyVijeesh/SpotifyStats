import React, { useState, useEffect } from 'react';
import './search.css';

const Search = (access_token) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const accessToken = access_token;

  const fetchSongs = async (query, page = 1) => {
    if (!query) return;

    setLoading(true);
    try {
      const encodedQuery = encodeURIComponent(query);
      console.log(' token - ' + JSON.stringify(accessToken.access_token));

      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodedQuery}&type=track&limit=10&offset=${
          (page - 1) * 10
        }`,
        {
          headers: {
            Authorization: `Bearer ${accessToken.access_token}`,
          },
        }
      );

      const data = await response.json();
      console.log('data = ' + JSON.stringify(data));
      setSearchResults(data.tracks.items);
      setTotalResults(data.tracks.total);
    } catch (error) {
      console.error('Error fetching songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setQuery(e.target.value);
    fetchSongs(e.target.value, 1);
  };

  const handleSelectSong = (song) => {
    setSelectedSong(song);
  };

  const handlePagination = (direction) => {
    const newPage = direction === 'next' ? page + 1 : page - 1;
    setPage(newPage);
    fetchSongs(query, newPage);
  };

  const fetchTrackFeatures = async (songId) => {
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/audio-features/${songId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken.access_token}`,
          },
        }
      );
      const data = await response.json();
      console.log(accessToken.access_token);
      alert(
        `Song Features: Danceability: ${data.danceability}, Energy: ${data.energy}, Valence: ${data.valence}`
      );
    } catch (error) {
      console.error('Error fetching song features:', error);
    }
  };
  const renderResults = () => {
    if (loading) {
      return <p>Loading...</p>;
    }

    if (searchResults.length === 0) {
      return <p> </p>;
    }

    return (
      <ul>
        {searchResults.map((song) => (
          <div>
            <div className="resultDiv">
              <li key={song.id} className="resultLi">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <img src={song.album.images[1].url} className="trackImg" />

                  <h3 className="resultTitle">
                    {song.name} -{' '}
                    {song.artists.map((artist) => artist.name).join(', ')}
                  </h3>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <button
                    onClick={() =>
                      window.open(`https://open.spotify.com/track/${song.id}`)
                    }
                    className="resultBtns"
                  >
                    Play Track
                  </button>
                  <button
                    onClick={() => handleSelectSong(song)}
                    className="resultBtns"
                  >
                    View Details
                  </button>
                </div>
              </li>
            </div>
          </div>
        ))}
      </ul>
    );
  };

  const renderSelectedSong = () => {
    if (!selectedSong) return null;

    return (
      <div className="resultDiv">
        <h2>{selectedSong.name}</h2>
        <p>
          Artists:{' '}
          {selectedSong.artists.map((artist) => artist.name).join(', ')}
        </p>
        <p>Album: {selectedSong.album.name}</p>
        <p>Link: {`https://open.spotify.com/track/${selectedSong.id}`}</p>
        <img src={selectedSong.album.images[0].url} alt={selectedSong.name} />
      </div>
    );
  };

  return (
    <div className="searchContainer">
      <h2 className="searchHeader">Search for Songs</h2>
      <input
        type="text"
        value={query}
        onChange={handleSearchChange}
        placeholder="Enter a song name..."
        className="searchInput"
      />

      <div className="resultContainer">
        <h3 className="resultHeader">Results:</h3>
        {renderResults()}

        {totalResults > 10 && (
          <div className="paginationDiv">
            <button
              disabled={page === 1}
              onClick={() => handlePagination('prev')}
              className="paginationBtn"
            >
              Previous
            </button>
            <button
              disabled={page * 10 >= totalResults}
              onClick={() => handlePagination('next')}
              className="paginationBtn"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {renderSelectedSong()}
    </div>
  );
};

export default Search;
