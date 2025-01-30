import React from 'react';
import './profile.css';

const Profile = ({ details, playlistCount, logOut }) => {
  return (
    <>
      <div>
        {details && (
          <div className="profileContainer">
            <img src={details.images[0].url} className="profileImg" />
            <div style={{ width: '100%' }}>
              <h2 className="profileTitle">Welcome, {details.display_name}!</h2>
              <p className="profileDetails">
                <strong>Playlists Created:</strong> {playlistCount} <br />
                <strong>Followers:</strong> {details.followers.total} <br />
                <button onClick={logOut} className="logoutBtn">
                  Log Out
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Profile;
