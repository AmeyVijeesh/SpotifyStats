import React, { useState } from 'react';
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
      const offset = (page - 1) * 10;
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodedQuery}&type=track&limit=10&offset=${offset}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken.access_token}`,
          },
        }
      );

      const data = await response.json();
      if (data.tracks) {
        setSearchResults(data.tracks.items);
        setTotalResults(data.tracks.total);
      } else {
        setSearchResults([]);
        setTotalResults(0);
      }
    } catch (error) {
      console.error('Error fetching songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setPage(1);
    fetchSongs(newQuery, 1);
  };

  const handleSelectSong = (song) => {
    setSelectedSong(song);
  };

  const handlePagination = (direction) => {
    const newPage = direction === 'next' ? page + 1 : page - 1;
    setPage(newPage);
    fetchSongs(query, newPage);
  };

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
          <div key={song.id}>
            <div className="resultDiv">
              <li className="resultLi">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {song.album.images[1] && (
                    <img
                      src={song.album.images[1].url}
                      className="trackImg"
                      alt="Album Art"
                    />
                  )}
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
            <span>Page {page}</span>
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
