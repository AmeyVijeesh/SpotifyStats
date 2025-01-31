import React from 'react';
import bg_img from './assets/bgimg.jpg';
import './landingPage.css';

const Landing = ({ btnOnClick }) => {
  return (
    <>
      <div className="container_div">
        <img src={bg_img} className="side_img" />
        <div className="right_div">
          <h1 className="landingHeading">Refine your Listening Experience.</h1>
          <h2 className="landingHeading2">
            Login with Spotify to get started.
          </h2>
          <button onClick={btnOnClick} className="loginBtn">
            Log in with Spotify
          </button>
        </div>
      </div>
    </>
  );
};

export default Landing;
