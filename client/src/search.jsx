import React, { useState, useEffect } from 'react';

const SongSearchApp = (access_token) => {
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

  // Handle changes in the search input
  const handleSearchChange = (e) => {
    setQuery(e.target.value);
    fetchSongs(e.target.value, 1); // Fetch first page of results
  };

  // Handle song selection
  const handleSelectSong = (song) => {
    setSelectedSong(song);
  };

  // Handle pagination (next/previous page)
  const handlePagination = (direction) => {
    const newPage = direction === 'next' ? page + 1 : page - 1;
    setPage(newPage);
    fetchSongs(query, newPage);
  };

  // Display the song's detailed view (audio features, etc.)
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

  // Search results UI (song list)
  const renderResults = () => {
    if (loading) {
      return <p>Loading...</p>;
    }

    if (searchResults.length === 0) {
      return <p>No results found.</p>;
    }

    return (
      <ul>
        {searchResults.map((song) => (
          <li key={song.id}>
            <div>
              {song.name} -{' '}
              {song.artists.map((artist) => artist.name).join(', ')}
            </div>
            <button onClick={() => fetchTrackFeatures(song.id)}>
              View Features
            </button>
            <button onClick={() => handleSelectSong(song)}>View Details</button>
          </li>
        ))}
      </ul>
    );
  };

  // Detailed view for the selected song
  const renderSelectedSong = () => {
    if (!selectedSong) return null;

    return (
      <div>
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
    <div>
      <h1>Song Search</h1>

      <input
        type="text"
        value={query}
        onChange={handleSearchChange}
        placeholder="Search for songs"
      />

      <div>
        <h3>Search Results:</h3>
        {renderResults()}

        {totalResults > 10 && (
          <div>
            <button
              disabled={page === 1}
              onClick={() => handlePagination('prev')}
            >
              Previous
            </button>
            <button
              disabled={page * 10 >= totalResults}
              onClick={() => handlePagination('next')}
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

export default SongSearchApp;
