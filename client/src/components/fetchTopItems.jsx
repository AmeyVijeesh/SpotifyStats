import React, { useEffect } from 'react';
import { useState } from 'react';

const FetchTopItems = ({ access_token }) => {
  const [topTracks, setTopTracks] = useState(null);
  const [topArtists, setTopArtists] = useState(null);
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

  useEffect(() => {
    if (access_token) {
      fetchTopItems();
    }
  }, [access_token]);

  return (
    <>
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
    </>
  );
};

export default FetchTopItems;
