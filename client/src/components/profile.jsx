import React from 'react';
import './profile.css';

const Profile = ({ details }) => {
  return (
    <>
      <div>
        {details && (
          <div className="profileContainer">
            <img src={details.images[0].url} className="profileImg" />
            <div style={{ textAlign: 'center' }}>
              <h2 className="profileTitle">Welcome, {details.display_name}!</h2>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Profile;
