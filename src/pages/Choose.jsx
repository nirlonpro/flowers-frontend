import { Link } from "react-router-dom";
import "../styles/Choose.css";

import bgImage from "../assets/abc.png";

export default function Choose() {
  return (
    <div
      className="choosePage"
      style={{
        backgroundImage: `url(${bgImage})`,
      }}
    >
      <div className="background"></div>

      <div className="mainContainer">

        <h1>🌸 Hey! This is for YOU 💖</h1>

        <p className="subtitle">
          Every flower tells a beautiful story.
          Choose the one made especially for you.
        </p>

        <div className="outerBox">

          <div className="innerBox">

            <Link
              to="/rose"
              className="flowerBtn roseBtn"
            >
              🌹
              <span>Rose</span>
            </Link>

            <Link
              to="/lily"
              className="flowerBtn lilyBtn"
            >
              🌼
              <span>Lily</span>
            </Link>

            

          </div>

        </div>

      </div>
    </div>
  );
}