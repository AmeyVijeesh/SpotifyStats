import React, { useState } from 'react';
import Modal from 'react-modal';
import './playlists.css';

Modal.setAppElement('#root');

const Playlists = ({ playlists, extractor }) => {
  const [playlistData, setPlaylistData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const fetchPlaylistData = async (playlistId) => {
    const playlistIdExtracted = extractor(playlistId);
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
  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <h1 className="playlistsHeader">Your Playlists</h1>
        {playlists?.length > 0 &&
          playlists.map((playlist) => (
            <div key={playlist.id} className="playlistsDiv">
              {playlist.images.length > 0 && (
                <img
                  src={playlist.images[0]?.url}
                  alt={playlist.name}
                  className="playlistsImg"
                />
              )}
              <div>
                <h2 className="playlistsTitle">{playlist.name}</h2>
                <p className="playlistsDisc">{playlist.description}</p>
                <button
                  onClick={() => {
                    fetchPlaylistData(playlist.tracks?.href);
                    openModal();
                  }}
                  className="playlistsBtn"
                >
                  View Songs
                </button>
              </div>
            </div>
          ))}
      </div>
      {playlistData && (
        <Modal isOpen={isOpen} onRequestClose={closeModal}>
          <div>
            <h3>Playlist Tracks:</h3>
            <ul>
              {playlistData.map((track) => (
                <li key={track.id}>
                  {track.track.name} -{' '}
                  {track.track.artists.map((artist) => artist.name).join(', ')}
                </li>
              ))}
            </ul>
            <button onClick={closeModal}>Close Modal</button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default Playlists;
