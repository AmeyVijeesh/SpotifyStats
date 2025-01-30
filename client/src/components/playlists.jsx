import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import './playlists.css';

Modal.setAppElement('#root');

const Playlists = ({ playlists, extractor, at }) => {
  const [playlistData, setPlaylistData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTracks, setTotalTracks] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const tracksPerPage = 50; // Pagination for every 100 songs

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    setIsOpen(false);
    setPlaylistData([]); // Clear data when closing the modal
    setCurrentPage(1); // Reset pagination
  };

  const fetchPlaylistData = async (playlistId) => {
    const playlistIdExtracted = extractor(playlistId);
    if (!playlistIdExtracted || !playlistIdExtracted.trim()) {
      alert('Please enter a valid playlist ID.');
      return;
    }

    let allTracks = [];
    let nextUrl = `https://api.spotify.com/v1/playlists/${playlistIdExtracted}/tracks?offset=0&limit=100`;

    try {
      while (nextUrl) {
        const response = await fetch(nextUrl, {
          headers: {
            Authorization: `Bearer ${at}`, // Add the token here
          },
        });
        const data = await response.json();

        allTracks = [...allTracks, ...data.items];
        nextUrl = data.next; // Get the next page if available
      }

      setPlaylistData(allTracks);
      setTotalTracks(allTracks.length);
      console.log(allTracks.length); // Total number of tracks
    } catch (error) {
      console.error('Error fetching playlist data:', error);
    }
  };

  useEffect(() => {
    console.log(totalTracks);
  }, [totalTracks]);

  const indexOfLastTrack = currentPage * tracksPerPage;
  const indexOfFirstTrack = indexOfLastTrack - tracksPerPage;
  const currentTracks = playlistData.slice(indexOfFirstTrack, indexOfLastTrack);

  const handleNextPage = () => {
    if (indexOfLastTrack < playlistData.length) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
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
        <Modal
          isOpen={isOpen}
          onRequestClose={closeModal}
          className="playlistModal"
        >
          <div className="playlistModalDiv">
            <h3 className="playlistModalTitle">Playlist Tracks:</h3>
            <ol className="playlistModalContent">
              {currentTracks.map((track) => (
                <li key={track.id}>
                  {track.track.name} -{' '}
                  {track.track.artists.map((artist) => artist.name).join(', ')}
                </li>
              ))}
            </ol>

            <div className="paginationControls">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="playlistModalButton"
              >
                Previous
              </button>
              <span className="paginationInfo">
                Page {currentPage} of {Math.ceil(totalTracks / tracksPerPage)}
              </span>
              <button
                onClick={handleNextPage}
                disabled={indexOfLastTrack >= playlistData.length}
                className="playlistModalButton"
              >
                Next
              </button>
            </div>

            <button className="playlistModalButton" onClick={closeModal}>
              Close Modal
            </button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default Playlists;
